# Dev Build

execute the following commands to switch to the dev builds:
```shell
cd ~/mooncord
git checkout dev
``` 
<br><br>
and pls adjust your moonraker config to the following config:  
```c
[update_manager client MoonCord]
type: git_repo
path: /home/pi/mooncord
primary_branch: dev
origin: https://github.com/eliteschwein/mooncord.git
install_script: scripts/install.sh
enable_node_updates: True
``` 