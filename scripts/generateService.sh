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
MCCAMURL="http://127.0.0.1/webcam/?action=snapshot"
MCCONTROLLER=""

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
}


locate_config()
{
    if [[ "$MCCONFIGPATH" == "" ]]
    then
        MCCONFIGPATH="."
    fi
}

restart_MoonCord() {
    ok_msg "Restart MoonCord!"
    sudo systemctl restart $MCSERVICENAME.service
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
            --webcam_url) MCCAMURL=${VALUE};;
            --controller_tag) MCCONTROLLER=${VALUE};;
            *)   
    esac    
done

setup
install_systemd_service
restart_MoonCord