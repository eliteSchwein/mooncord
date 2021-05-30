#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
MCPATH="$( pwd -P )"
MCCONFIGPATH=""

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

setup(){
    locate_config
    generate_config
    migrate_config
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

generate_config()
{
    echo "Generate Configs"
    cp $SCRIPTPATH/mooncord.json $MCCONFIGPATH/mooncord.json
    cp $SCRIPTPATH/mooncord-status.json $MCCONFIGPATH/mooncord-status.json
    cp $SCRIPTPATH/mooncord-webcam.json $MCCONFIGPATH/mooncord-webcam.json
    cp $SCRIPTPATH/database.json $MCPATH/database.json
}

migrate_config()
{
    echo "Migrate Configs"
    npm run migrate2 "$MCPATH/" "$MCCONFIGPATH/"
}

start_MoonCord() {

    echo "Start MoonCord, please make sure you configured the Bot correctly!"
    sudo systemctl start MoonCord
}

setup
install_systemd_service
start_MoonCord
