#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MCPATH="$( pwd -P )"

install_packages()
{
    echo "Update package data"
    sudo apt update

    if ! command -v node -v >/dev/null 2>&1
    then
        echo "Download Node 11"
        wget https://nodejs.org/download/release/v11.15.0/node-v11.15.0-linux-armv6l.tar.gz

        echo "Install Node 11.15.0"
        tar -xvf node-v11.15.0-linux-armv6l.tar.gz >/dev/null 2>&1 
        sudo cp -R node-v11.15.0-linux-armv6l/* /usr/local/ >/dev/null 2>&1 

        echo "Remove Node File and Folder"
        rm -rf node-v11.15.0-linux-armv6l.tar.gz
        rm -rf node-v11.15.0-linux-armv6l
    fi

    echo "Install Dependencies"
    npm i --only=prod
}

install_systemd_service()
{
    echo "Installing MoonCord unit file"

    SERVICE=$(<$SCRIPTPATH/MoonCord.service)
    MCPATH_ESC=$(sed "s/\//\\\\\//g" <<< $MCPATH)
    MCNPM="$( command -v npm -v )"

    SERVICE=$(sed "s/MC_USER/$USER/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_DIR/$MCPATH_ESC/g" <<< $SERVICE)
    #SERVICE=$(sed "s/MC_NPM/$MCNPM/g" <<< $SERVICE)

    echo "$SERVICE" | sudo tee /etc/systemd/system/MoonCord.service > /dev/null
    sudo systemctl daemon-reload
    sudo systemctl enable MoonCord
}

modify_user()
{
    sudo usermod -a -G tty $USER
}

start_MoonCord() {

    echo "Start MoonCord, please make sure you configured the Bot correctly!"
    sudo systemctl start MoonCord
}

install_packages
modify_user
install_systemd_service
start_MoonCord
