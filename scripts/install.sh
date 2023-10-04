#!/bin/bash

### credits to th33xitus for the script base
clear
set -e

### set color variables
green=$(echo -en "\e[92m")
yellow=$(echo -en "\e[93m")
red=$(echo -en "\e[91m")
cyan=$(echo -en "\e[96m")
default=$(echo -en "\e[39m")

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MCPATH="$( pwd -P )"
MCCONFIGPATH="/home/$(whoami)/printer_data/config"
MCLOGPATH="/home/$(whoami)/printer_data/logs"
MCSERVICENAME="MoonCord"
MCTOKEN=""
MCWEBTOKEN=""
MCURL="http://127.0.0.1"
MCMOONRAKERSERVICE="moonraker"
WRITECONFIG=true

questions()
{
    title_msg "Welcome to the MoonCord Installer, as soon as you finished the answers the Installation will start."

    if [ "$MCCONFIGPATH" == "/home/$(whoami)/printer_data/config" ];
    then
        status_msg "Please enter your Klipper Config Path"
        while true; do
            read -p "$cyan Path (leave empty if $MCCONFIGPATH is valid): $default" klipper_config
            case $klipper_config in
                "") break;;
                * ) MCCONFIGPATH="$klipper_config"; break;;
            esac
        done
    fi
    ok_msg "Klipper Config Path set: $MCCONFIGPATH"

    if [ "$MCLOGPATH" == "/home/$(whoami)/printer_data/logs" ];
    then
        status_msg "Please enter your Klipper Log Path"
        while true; do
            read -p "$cyan Path (leave empty if $MCLOGPATH is valid): $default" klipper_logs
            case $klipper_logs in
                "") break;;
                * ) MCLOGPATH="$klipper_logs"; break;;
            esac
        done
    fi
    ok_msg "Klipper Log Path set: $MCLOGPATH"

    if [ -f "$MCCONFIGPATH/mooncord.cfg" ];
    then
        status_msg "MoonCord config found, do you want to overwrite it?"
        while true; do
            read -p "$cyan[Y/N]: $default" yn
            case $yn in
                [Yy]* ) status_msg "Continue Questions..."; break;;
                [Nn]* ) status_msg "Skip Questions and Config overwrite...";WRITECONFIG=false;return;break;;
                * ) warn_msg "Please answer [Y/y] for yes and [N/n] for no.";;
            esac
        done
    fi

    if [ "$MCTOKEN" == "" ];
    then
        status_msg "Please enter your Discord Token"
        while true; do
            read -p "$cyan Token: $default" discord_token
            case $discord_token in
                "") warn_msg "Please Enter your Discord Bot Token, you can get one from https://discord.com/developers/applications";;
                * ) MCTOKEN="$discord_token"; break;;
            esac
        done
    fi
    ok_msg "Discord Token set: $MCTOKEN"

    if [ "$MCWEBTOKEN" == "" ];
    then
        status_msg "Please enter your Moonraker Token (optional)"
        read -p "$cyan Token: $default" moonraker_token
        MCWEBTOKEN="$moonraker_token"
        ok_msg "Moonraker Token set: $MCWEBTOKEN"
    fi

    if [ "$MCURL" == "http://127.0.0.1" ];
    then
        status_msg "Please enter your Webinterface URL"
        while true; do
            read -p "$cyan URL (leave empty if $MCURL is valid): $default" moonraker_url
            case $moonraker_url in
                "") break;;
                * ) MCURL="$moonraker_url"; break;;
            esac
        done
    fi
    ok_msg "Moonraker URL set: $MCURL"
}

install_packages()
{
    status_msg "Update package data"
    sudo apt update

    status_msg "Install needed packages"
    sudo apt-get -y install --no-install-recommends git curl

    if ! command -v node -v >/dev/null 2>&1
    then
        status_msg "Add NodeJS 20.x Repo"
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        sudo apt-get update

        status_msg "Install NodeJS 20.X or higher"

        if [[ "$(is_bookworm)" = "1" ]];
        then
            sudo apt-get install -y nodejs npm
        else
            sudo apt-get install -y nodejs
        fi

        status_msg "Install Dependencies, this will take some time please wait....."
        sudo npm i -g npm@latest
        npm ci --omit=dev
    else
        status_msg "NodeJS found, do you want to update it?"
        while true; do
            read -p "$cyan[Y/N]: $default" yn
            case $yn in
                [Yy]* ) bash scripts/migrateNode.sh; break;;
                [Nn]* ) status_msg "Install Dependencies, this will take some time please wait.....";npm ci --omit=dev;break;;
                * ) warn_msg "Please answer [Y/y] for yes and [N/n] for no.";;
            esac
        done
    fi
}

install_systemd_service()
{
    status_msg "Installing MoonCord unit file"
    MCNPM="$( command -v npm -v )"

    SERVICE=$(<$SCRIPTPATH/MoonCord.service)
    MCPATH_ESC=$(sed "s/\//\\\\\//g" <<< $MCPATH)
    MCNPM_ESC=$(sed "s/\//\\\\\//g" <<< $MCNPM)
    MCMOONRAKERSERVICE_ESC=$(sed "s/\//\\\\\//g" <<< $MCMOONRAKERSERVICE)
    MCCONFIGPATH_ESC=$(sed "s/\//\\\\\//g" <<< "$MCCONFIGPATH/")

    SERVICE=$(sed "s/MC_USER/$USER/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_DIR/$MCPATH_ESC/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_NPM/$MCNPM_ESC/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_MOONRAKER_SERVICE/$MCMOONRAKERSERVICE_ESC/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_CONFIG_PATH/$MCCONFIGPATH_ESC/g" <<< $SERVICE)

    echo "$SERVICE" | sudo tee /etc/systemd/system/$MCSERVICENAME.service > /dev/null
    sudo systemctl daemon-reload
    sudo systemctl enable $MCSERVICENAME.service
}

modify_user()
{
    sudo usermod -a -G tty $USER
}

setup(){
    locate_config
    generate_config
}

locate_config()
{
    if [[ "$MCCONFIGPATH" == "" ]]
    then
        MCCONFIGPATH="."
    fi
}

generate_config() {
    if [ "$WRITECONFIG" = false ];
    then
        return
    fi
    status_msg "Generate Config"

    CONFIG=$(<$SCRIPTPATH/mooncord.cfg)

    MCURL_ESC=$(sed "s/\//\\\\\//g" <<< $MCURL)
    MCTOKEN_ESC=$(sed "s/\//\\\\\//g" <<< $MCTOKEN)
    MCWEBTOKEN_ESC=$(sed "s/\//\\\\\//g" <<< $MCWEBTOKEN)
    MCSERVICENAME_ESC=$(sed "s/\//\\\\\//g" <<< $MCSERVICENAME)

    CONFIG=$(sed "s/MC_URL/$MCURL_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_TOKEN/$MCTOKEN_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_WEB_TOKEN/$MCWEBTOKEN_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_SERVICE_NAME/$MCSERVICENAME_ESC/g" <<< $CONFIG)

    if [ ! -d "$MCCONFIGPATH/" ];
    then
      mkdir "$MCCONFIGPATH/"
    fi

    if [ ! -d "$MCLOGPATH/" ];
    then
      mkdir "$MCLOGPATH/"
    fi

    if [ ! -d "/tmp/$MCSERVICENAME_ESC/" ];
    then
      mkdir "/tmp/$MCSERVICENAME_ESC/"
      touch "/tmp/$MCSERVICENAME_ESC/mooncord.log"
      ln -s "/tmp/$MCSERVICENAME_ESC/mooncord.log" "$MCLOGPATH/mooncord.log"
    fi

    status_msg "Write Config"
    echo "$CONFIG" | sudo tee $MCCONFIGPATH/mooncord.cfg > /dev/null
    sed "s/MC_SERVICE/$MCSERVICENAME/g" $MCCONFIGPATH/mooncord.cfg
    sudo chown $(whoami) $MCCONFIGPATH/mooncord.cfg
}

verify_Controller() {
    ok_msg "Temporary Start MoonCord for the Controller verification"
    npm start $MCCONFIGPATH setup
}

start_MoonCord() {
    ok_msg "Start MoonCord, please make sure you configured the Bot correctly!"
    sudo systemctl start $MCSERVICENAME.service
}

warn_msg(){
  echo -e "${red}<!!!!> $1${default}"
}

status_msg(){
  echo; echo -e "${yellow}###### $1${default}"
}

ok_msg(){
  echo -e "${green}>>>>>> $1${default}"
}

title_msg(){
  echo -e "${cyan}$1${default}"
}

get_date(){
  current_date=$(date +"%y%m%d-%H%M")
}

print_unkown_cmd(){
  ERROR_MSG="Invalid command!"
}

print_msg(){
  if [[ "$ERROR_MSG" != "" ]]; then
    echo -e "${red}"
    echo -e "#########################################################"
    echo -e " $ERROR_MSG "
    echo -e "#########################################################"
    echo -e "${default}"
  fi
  if [ "$CONFIRM_MSG" != "" ]; then
    echo -e "${green}"
    echo -e "#########################################################"
    echo -e " $CONFIRM_MSG "
    echo -e "#########################################################"
    echo -e "${default}"
  fi
}

clear_msg(){
  unset CONFIRM_MSG
  unset ERROR_MSG
}

for ARGUMENT in "$@"
do

    KEY=$(echo $ARGUMENT | cut -f1 -d=)
    VALUE=$(echo $ARGUMENT | cut -f2 -d=)   
    
    case "$KEY" in
            --config_path) MCCONFIGPATH=${VALUE} ;;
            --log_path) MCLOGPATH=${VALUE} ;;
            --service_suffix) MCSERVICENAME="${MCSERVICENAME}_${VALUE}" ;;
            --discord_token) MCTOKEN=${VALUE};;
            --moonraker_token) MCWEBTOKEN=${VALUE};;
            --moonraker_url) MCURL=${VALUE};;
            --moonraker_service) MCMOONRAKERSERVICE=${VALUE};;
            *)   
    esac    
done

is_bookworm() {
    if [[ -f /etc/os-release ]]; then
        grep -cq "bookworm" /etc/os-release &> /dev/null && echo "1" || echo "0"
    fi
}

if [[ ${UID} == '0' ]]; then
    warn_msg "You cant run this script as Root!"
    exit 1
fi

questions
install_packages
modify_user
setup
verify_Controller
install_systemd_service
start_MoonCord
