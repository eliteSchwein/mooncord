![Title](https://github.com/eliteSchwein/mooncord/blob/master/images/github-title.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/github/package-json/v/eliteschwein/mooncord)
![Tested](https://img.shields.io/badge/rpi%20tested-zero%20%26%204-brightgreen)
<br>
[![codebeat badge](https://codebeat.co/badges/a9c514a4-8736-46e0-90c8-d097345589d1)](https://codebeat.co/projects/github-com-eliteschwein-mooncord-master)
[![PR](https://img.shields.io/github/issues-pr/eliteschwein/mooncord)](https://github.com/eliteSchwein/mooncord/pulls)
[![Issues](https://img.shields.io/github/issues/eliteschwein/mooncord)](https://github.com/eliteSchwein/mooncord/issues)

## Discord Community Server

[![Discord](https://img.shields.io/discord/626717239210672139)](https://discord.gg/auhjVJYqCf)

## Preparations

Firstly make sure you've got a Bot Application, you can make it here: [Tutorial](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token).

You need then the Bot Token: [Tutorial](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) <br>
You also need Application ID and Public Key:
[Picture](https://github.com/eliteSchwein/mooncord/blob/dev/images/example-application.png)

## Installation

#### Install Git first

    $ sudo apt install git

#### Install MoonCord and its Dependencies

    $ cd ~/
    $ git clone https://github.com/eliteSchwein/mooncord.git
    $ cd ~/mooncord
    $ bash scripts/install.sh

#### Configure Moonraker Update manager

put this into your moonraker.conf

    [update_manager client MoonCord]
    type: git_repo
    path: /home/pi/mooncord
    origin: https://github.com/eliteschwein/mooncord.git
    install_script: scripts/install.sh
    enable_node_updates: True

## Configuration

You need to configure the bot before you start it the first time!

Explanation config.json

- moonrakersocketurl: The URL to your Moonraker Websocket URL (example: ws://127.0.0.1/websocket)
- moonrakerurl: The URL to your Moonraker API Url (example: http://127.0.0.1)

Important Note, you need to configure both Moonraker URL's

- bottoken: Enter your Bot Token here [Preparations](https://github.com/eliteSchwein/mooncord/tree/dev#preparations)
- botapplicationkey: Enter your Application Public Key here [Preparations](https://github.com/eliteSchwein/mooncord/tree/dev#preparations)
- botapplicationid: Enter your Application Public ID here [Preparations](https://github.com/eliteSchwein/mooncord/tree/dev#preparations)
- masterid: Enter your Client ID here [Tutorial](https://techswift.org/2020/04/22/how-to-find-your-user-id-on-discord)

Important Note, you need to configure bottoken for the bot to work, and masterid to access all commands!

- statusupdateinterval: Auto Status Update per Seconds or Percent (default: 10)
- statusupdatepercent: Use Percent for Auto Status instead of Seconds (default: false)

## Invite

you will see the Invite Link on Startup in the Log, to retrieve the look use

$ sudo systemctl status MoonCord

alternative you can use this URL:

https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=3422944320&scope=bot%20applications.commands

Please replace CLIENT_ID with the Bot ID

## Usage

    $ sudo systemctl <start/stop/restart/status> MoonCord

## Permissions

Roles:

- Admin:
  - Can access the following Commands:
    - All Access Role Commands
    - Channel Managment Commands
    - Print Pause/Resume/Stop
    - List Print Files
- Master:
  - Can access the following Commands:
    - All Commands
  - Can be configured in the config.json

## Commands

- Printing:
  - printjob start &#60;filename&#62;: start a Print Job with Thumbnail Preview
  - printjob cancel: stop the Print Job
  - printjob pause: pause the Print Job
  - printjob resume: resume the Print Job
  - fileinfo &#60;filename&#62;: shows Informations about a Print File with Thumbnail Preview
  - listfiles: list all GCode Files
  - status: shows the current Status of the Printer
  - temp: shows current temperatures
  - execute &#60;gcode&#62;: execute a Gcode Command
- Basic Commands:
  - info: shows informations about the bot
  - notify: enable Status Updates via DM
  - hsinfo &#60;component&#62;: shows some Information about the Hardware and Software
- Permissions:
  _Note: The groups are explained above [URL](https://github.com/eliteSchwein/mooncord/blob/master/README.md#permissions)_
  - admin &#60;user_or_role&#62;: add or remove Admin from a User or Role
- Channel Managment:
  - editchannel: add or remove a Channel as Broadcast Channel

## Credit, sources and inspiration

- [Kevin O'Connor](https://github.com/KevinOConnor) for the awesome 3D printer firmware [Klipper](https://github.com/KevinOConnor/klipper)
- [Eric Callahan (arksine)](https://github.com/Arksine) for [Moonraker (Klipper API)](https://github.com/Arksine/moonraker). Without Moonraker, Mooncord would not be possible.
- [Flaticon](https://www.flaticon.com) for parts of the Logo and most of the Icons
- [Snazzah](https://github.com/Snazzah/slash-create) for the Slash Command library
