#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MCPATH="$( pwd -P )"
MCCONFIGPATH=""

install_packages()
{
    echo "Update package data"
    sudo apt update

    echo "Install needed packages"
    sudo apt-get -y install nano git

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

    echo "$SERVICE" | sudo tee /etc/systemd/system/MoonCord.service > /dev/null
    sudo systemctl daemon-reload
    sudo systemctl enable MoonCord
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
    echo -n "Where do you want your Configs? "
    read filepath

        if [ ! -d $filepath ]; then
        echo "Please insert a correct path"
        sleep 1
        locate_config
        fi

        MCCONFIGPATH=$filepath
        echo "your config path is now $filepath"
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

install_packages
modify_user
setup
open_config
install_systemd_service
start_MoonCord
