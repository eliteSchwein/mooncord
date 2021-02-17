# mooncord
a high customizable Moonraker Discord Bot

## Installation

Firstly make sure you've got a Bot Token, you get them here: [Tutorial](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). 

#### Install Git first

    $ sudo apt install git


For the ARM V7 Pi's (Pi3 and higher) install Node via:

    $ curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
    $ sudo bash nodesource_setup.sh
    $ sudo apt install nodejs
    
For the older Pi's use:

    $ wget https://nodejs.org/download/release/v11.15.0/node-v11.15.0-linux-armv6l.tar.gz
    $ tar -xvf node-v11.15.0-linux-armv6l.tar.gz
    $ cd node-v11.15.0-linux-armv6l
    $ sudo cp -R * /usr/local/

#### Next, clone this repository:

    $ git clone https://github.com/eliteSchwein/mooncord.git

#### Then install all node Modules:

    $ cd mooncord
    $ npm i
    
## Configuration

You need to configure the bot before you start it the first time!

Explenation config.json

* moonrakersocketurl: The URL to your Moonraker Websocket URL (example: ws://127.0.0.1/websocket)
* moonrakerurl: The URL to your Moonraker API Url (example: http://127.0.0.1)

Important Note, you need to configure both Moonraker URL's

* bottoken: Enter your Bot Token here
* masterid: Enter your Client ID here [Tutorial](https://techswift.org/2020/04/22/how-to-find-your-user-id-on-discord)
* prefix: Enter your prefered Bot Prefix here (default: mc!)

Important Note, you need to configure bottoken for the bot to work, and masterid to access all commands!

* defaulttheme: global Theme for the Status Messages, your bot Admins can change the Theme per Discord Server (default: slate)

Important Note, you need to configure imagechannel, otherwise the Bot might crash or not working properly

* statusupdateinterval: Auto Status Update per Seconds or Percent (default: 10)
* statusupdatepercent: Use Percent for Auto Status instead of Seconds (default: false)

## Usage

Start mooncord:

    $ cd mooncord
    $ npm start

## Permissions

  Roles:

  * Access:
      * Can access the following Commands: 
         * Status
         * Help
         * Info
      * Access can be given to everyone via _prefix_generalaccess 
      * or per User via _prefix_addaccess _roleORusertag_, you can revoke the Access per User via _prefix_removeaccess _roleORusertag_
  * Admin:
      * Can access the following Commands: 
         * All Access Role Commands
         * Channel Managment Commands
         * Print Pause/Resume/Stop
         * List Print Files
         * Theme Command
      * Bot Admin can be given per User via _prefix_addadmin _roleORusertag_, you can revoke the Bot Admin per User via _prefix_removeadmin _roleORusertag_
  * Master:
      * Can access the following Commands: 
         * All Commands
      * Can be configured in the config.json
  
## Commands
  
   * Printing:
      * print _filename_: start a Print with Thumbnail Preview
      * fileinfo _filename_: shows Informations about a Print File with Thumbnail Preview
      * pause: pause a Print
      * stop: stop a Print
      * resume: resume a paused Print
      * listprints: list all GCode Files
      * status: shows the current Status of the Printer
   * Basic Commands:
      * help: shows all commands
      * info: shows informations about the bot
   * Permissions:
      _Note: its explained above with the roles_
      * generalaccess: allow everyone to the Access Role
      * addaccess _userORroletag_: add Access from a User or Role
      * removeaccess _userORroletag_: remove Access from a User or Role
      * addadmin _userORroletag_: add Admin from a User or Role
      * removeadmin _userORroletag_: remove Admin from a User or Role
   * Channel Managment:
      * addchannel: add the Channel as Broadcast Channel
      * removechannel: remove the Channel as Broadcast Channel
   * Theme:
      * settheme: set Theme for the Discord Server
      * testtheme: test a Theme via the Build in Webserver (experimentell!)
   
