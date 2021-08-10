echo "Download Node 16.6.1"
wget https://nodejs.org/download/release/v16.6.1/node-v16.6.1-linux-armv7l.tar.gz

echo "Install Node 16.6.1"
tar -xvf node-v16.6.1-linux-armv7l.tar.gz >/dev/null 2>&1 
sudo cp -R node-v16.6.1-linux-armv7l/* /usr/local/ >/dev/null 2>&1 

echo "Remove Node File and Folder"
rm -rf node-v16.6.1-linux-armv7l.tar.gz
rm -rf node-v16.6.1-linux-armv7l