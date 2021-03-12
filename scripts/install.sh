#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MCPATH="$( pwd -P )"

install_packages()
{
    echo "Update package data"
    sudo apt update

    echo "Download Node 11"
    wget https://nodejs.org/download/release/v11.15.0/node-v11.15.0-linux-armv6l.tar.gz

    echo "Install Node 11.15.0"
    tar -xvf node-v11.15.0-linux-armv6l.tar.gz
    sudo cp -R node-v11.15.0-linux-armv6l/* /usr/local/

    echo "Remove Node File and Folder"
    rm -rf node-v11.15.0-linux-armv6l.tar.gz
    rm -rf node-v11.15.0-linux-armv6l
}

install_systemd_service()
{
    echo "Installing MoonCord unit file"

    SERVICE=$(<$SCRIPTPATH/MoonCord.service)
    MCPATH_ESC=$(sed "s/\//\\\\\//g" <<< $MCPATH)

    SERVICE=$(sed "s/MC_USER/$USER/g" <<< $SERVICE)
    SERVICE=$(sed "s/MC_DIR/$MCPATH_ESC/g" <<< $SERVICE)

    echo "$SERVICE" | sudo tee /etc/systemd/system/MoonCord.service > /dev/null
    sudo systemctl daemon-reload
    sudo systemctl enable MoonCord
}

modify_user()
{
    sudo usermod -a -G tty $USER
}

start_MoonCord() {
    sudo systemctl start MoonCord
}

install_packages
modify_user
install_systemd_service
start_MoonCord
