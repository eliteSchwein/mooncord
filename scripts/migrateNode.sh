
### credits to th33xitus for the script base
clear

### set color variables
green=$(echo -en "\e[92m")
yellow=$(echo -en "\e[93m")
red=$(echo -en "\e[91m")
cyan=$(echo -en "\e[96m")
default=$(echo -en "\e[39m")

warn_msg(){
  echo -e "${red}<!!!!> $1${default}"
}

status_msg(){
  echo; echo -e "${yellow}###### $1${default}"
}

ok_msg(){
  echo; echo -e "${green}>>>>>> $1${default}"
}

if [[ ${UID} == '0' ]]; then
    warn_msg "You cant run this script as Root!"
    exit 1
fi

status_msg "Remove old Node Modules"
sudo rm -rf /usr/local/lib/node_modules

status_msg "Remove old Node Version"
sudo rm  /usr/local/bin/node

status_msg "Add NodeJS 22.x Repo"
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update

status_msg "Install NodeJS 22.X or higher"
sudo apt-get install -y nodejs

status_msg "Rebuild NPM, this will take some time please wait....."
npm rebuild
sudo npm rebuild
sudo npm rebuild -g

status_msg "Update NPM"
sudo npm install -g npm@latest node-gyp@latest

status_msg "Install Dependencies, this will take some time please wait....."
npm ci --omit=dev

ok_msg "Please regenerate the Service with bash scripts/generateService.sh, if you used a custom path or service suffix, the arguments from the install script work also on the generate Service script"