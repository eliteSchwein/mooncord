# Multi Installation

!!! warning
    this is for advanced users only.

Except that you define a path on the clone command where the new mooncord installation should be installed:  
```shell
git clone https://github.com/eliteSchwein/mooncord.git PATH
```
<br><br>
And you need to configure a Service suffix, the Suffix will be placed after MoonCord_, you also should set the config path to the klipper directory:  
```shell
bash scripts/install.sh --service_suffix=SUFFIX --config_path=/KLIPPER/CONFIG/PATH
```  
<br><br>
## Example
Here is an Example for a second MoonCord installation:  
<br>
Install MoonCord and its Dependencies  
```shell
cd ~/
git clone https://github.com/eliteSchwein/mooncord.git mooncord2
cd ~/mooncord
bash scripts/install.sh --service_suffix=2 --config_path=/home/pi/klipper_config2
```  
<br>
Usage  
```shell
sudo systemctl <start/stop/restart/status> MoonCord_2
```