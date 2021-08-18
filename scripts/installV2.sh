#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MCPATH="$( pwd -P )"
MCCONFIGPATH=""
MCSERVICENAME="MoonCord"

install_packages()
{
    echo "Update package data"
    sudo apt update

    echo "Install needed packages"
    sudo apt-get -y install nano git ffmpeg

    if ! command -v node -v >/dev/null 2>&1
    then
        echo "Download Node 16.6.1"
        wget https://nodejs.org/download/release/v16.6.1/node-v16.6.1-linux-armv7l.tar.gz

        echo "Install Node 16.6.1"
        tar -xvf node-v16.6.1-linux-armv7l.tar.gz >/dev/null 2>&1 
        sudo cp -R node-v16.6.1-linux-armv7l/* /usr/local/ >/dev/null 2>&1 

        echo "Remove Node File and Folder"
        rm -rf node-v16.6.1-linux-armv7l.tar.gz
        rm -rf node-v16.6.1-linux-armv7l
    fi

    echo "Install Dependencies"
    npm ci --only=prod
}

install_systemd_service()
{
    echo "Installing MoonCord unit file"
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
    sudo systemctl enable MoonCord
}

modify_user()
{
    sudo usermod -a -G tty $USER
}

setup(){
    locate_config
    #generate_config
}


locate_config()
{ 
    echo "get Arguments"
    for ARGUMENT in "$@"
    do

        KEY=$(echo $ARGUMENT | cut -f1 -d=)
        VALUE=$(echo $ARGUMENT | cut -f2 -d=)   
        echo $VALUE
        case "$KEY" in
                --config_path) MCCONFIGPATH=${VALUE} ;;
                --service_suffix) MCSERVICENAME="${MCSERVICENAME}_${VALUE}" ;;     
                *)   
        esac    
    done
    
    while [[ $# -gt 0 ]]; do
    key="$1"
    echo $key

        case $key in
            --config_path)
                MCCONFIGPATH="$2"
                shift
                shift
            ;;
            --service_suffix)
                MCSERVICENAME="${MCSERVICENAME}_$2"
                shift
                shift
            ;;
            *)
                shift
            ;;
        esac
    done
    echo "${MCCONFIGPATH}"
    echo "${MCSERVICENAME}"
}

generate_config() {
    echo "Generate Configs"
    cp $SCRIPTPATH/mooncord.json $MCCONFIGPATH/mooncord.json
    cp $SCRIPTPATH/database.json $MCPATH/database.json
}

open_config() {
    echo "Open Config"
    sleep 1
    nano $MCCONFIGPATH/mooncord.json
}

start_MoonCord() {
    echo "Start MoonCord, please make sure you configured the Bot correctly!"
    sudo systemctl start MoonCord
}

#install_packages
#modify_user
setup
#open_config
#install_systemd_service
#start_MoonCord
