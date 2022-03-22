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
MCCONFIGPATH="/home/$(whoami)/klipper_config"
MCSERVICENAME="MoonCord"
MCTOKEN=""
MCWEBTOKEN=""
MCURL="http://127.0.0.1"
MCCAMURL="http://127.0.0.1/webcam/?action=snapshot"
MCCONTROLLER=""

questions()
{
    title_msg "Welcome to the MoonCord Installer, as soon as you finished the answers the Installation will start."

    if [ "$MCCONFIGPATH" == "/home/$(whoami)/klipper_config" ];
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

    if [ "$MCCAMURL" == "http://127.0.0.1/webcam/?action=snapshot" ];
    then
        status_msg "Please enter your Snapshot URL"
        while true; do
            read -p "$cyan URL (leave empty if $MCCAMURL is valid): $default" snapshot_url
            case snapshot_url in
                "") break;;
                * ) MCCAMURL="$snapshot_url"; break;;
            esac
        done
    fi
    ok_msg "Snapshot URL set: $MCCAMURL"

    status_msg "Please enter your Discord Tag"
    while true; do
        read -p "$cyan Tag (example#0001): $default" discord_tag
        case $discord_tag in
            "") warn_msg "Please Enter your Discord Tag (example#123)";;
            * ) MCCONTROLLER="$discord_tag"; break;;
        esac
    done
    ok_msg "Discord Tag set: $MCCONTROLLER"
}

install_packages()
{
    status_msg "Update package data"
    sudo apt update

    status_msg "Install needed packages"
    sudo apt-get -y install git

    if ! command -v node -v >/dev/null 2>&1
    then
        status_msg "Add NodeJS 16.x Repo"
        curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

        status_msg "Install NodeJS 16.X"
        sudo apt-get install -y nodejs

        status_msg "Install Dependencies, this will take some time please wait....."
        sudo npm i -g npm@latest
        npm ci --only=prod
    else
        status_msg "NodeJS found, do you want to update it?"
        while true; do
            read -p "$cyan[Y/N]: $default" yn
            case $yn in
                [Yy]* ) bash scripts/migrateNode.sh; break;;
                [Nn]* ) status_msg "Install Dependencies, this will take some time please wait.....";npm ci --only=prod;break;;
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
    MCCONFIGPATH_ESC=$(sed "s/\//\\\\\//g" <<< "$MCCONFIGPATH/")

    SERVICE=$(sed "s/MC_USER/$USER/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_DIR/$MCPATH_ESC/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_NPM/$MCNPM_ESC/g" <<< $SERVICE)
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
    status_msg "Generate Config"

    CONFIG=$(<$SCRIPTPATH/mooncord.json)

    MCURL_ESC=$(sed "s/\//\\\\\//g" <<< $MCURL)
    MCTOKEN_ESC=$(sed "s/\//\\\\\//g" <<< $MCTOKEN)
    MCWEBTOKEN_ESC=$(sed "s/\//\\\\\//g" <<< $MCWEBTOKEN)
    MCCAMURL_ESC=$(sed "s/\//\\\\\//g" <<< $MCCAMURL)
    MCCONTOLLER_ESC=$(sed "s/\//\\\\\//g" <<< $MCCONTROLLER)

    CONFIG=$(sed "s/MC_URL/$MCURL_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_TOKEN/$MCTOKEN_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_WEB_TOKEN/$MCWEBTOKEN_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_WEBCAM_URL/$MCCAMURL_ESC/g" <<< $CONFIG)
    CONFIG=$(sed "s/MC_CONTROLLER/$MCCONTOLLER_ESC/g" <<< $CONFIG)

    status_msg "Write Config"
    echo "$CONFIG" | sudo tee $MCCONFIGPATH/mooncord.json > /dev/null
    sed "s/MC_SERVICE/$MCSERVICENAME/g" $MCCONFIGPATH/mooncord.json
    sudo chown $(whoami) $MCCONFIGPATH/mooncord.json
}

verify_Controller() {
    ok_msg "Temporary Start MoonCord for the Controller verification"
    npm start $MCCONFIGPATH
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
            --service_suffix) MCSERVICENAME="${MCSERVICENAME}_${VALUE}" ;;
            --discord_token) MCTOKEN=${VALUE};;
            --moonraker_token) MCWEBTOKEN=${VALUE};;
            --moonraker_url) MCURL=${VALUE};;
            --webcam_url) MCCAMURL=${VALUE};;
            --controller_tag) MCCONTROLLER=${VALUE};;
            *)   
    esac    
done

questions
install_packages
modify_user
setup
verify_Controller
install_systemd_service
start_MoonCord