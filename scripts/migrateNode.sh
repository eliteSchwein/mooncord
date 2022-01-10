echo "Remove old Node Modules"
sudo rm -rf /usr/local/lib/node_modules

echo "Add NodeJS 16.x Repo"
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

echo "Install NodeJS 16.X"
sudo apt-get install -y nodejs

echo "Rebuild NPM"
npm rebuild
sudo npm rebuild
sudo npm rebuild -g

echo "Update NPM"
sudo npm install -g npm@latest node-gyp@latest

echo "Install Dependencies"
npm ci --only=prod
