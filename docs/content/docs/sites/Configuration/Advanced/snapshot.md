# [snapshot]

!!! warning
    the configuration is for advanced users only.

```c
backend: sharp
```
<small>define the backend of the snapshot converter.</small>  

| Backend             | Description                                                                      | Performance |
|---------------------|----------------------------------------------------------------------------------|-------------|
| sharpjs             | uses [sharpjs](https://sharp.pixelplumbing.com/).                                | good        |
| jimp                | uses [jimp](https://jimp-dev.github.io/jimp/). this will work on most platforms. | slow        |
| none                | this will render just a empty pixel.                                             | fastest     |
| graphicsmagick (gm) | uses [graphicsmagick](http://www.graphicsmagick.org/).                           | fast        |

!!! info
    the graphicsmagick (gm) backend requires that you install graphicsmagick (on debian `sudo apt install graphicsmagick`) manuelly.
  
<br>
```c
before_snapshot_commands:
```
<small>add commands before the snapshot (how they should look like is a bit below).</small>   
<br>
```c
enable_before_snapshot_commands: false
```
<small>enable commands before snapshot.</small>   
<br>
```c
delay_before_snapshot_commands: 0
```
<small>delay between commands.</small>   
<br>
```c
after_snapshot_commands:
```
<small>add commands after the snapshot (how they should look like is a bit below).</small>   
<br>
```c
enable_after_snapshot_commands: false
```
<small>enable commands after snapshot.</small>   
<br>
```c
delay_after_snapshot_commands: 0
```
<small>delay between commands.</small>  
<br><br>
command configuration:
<br>
```c
- gcode: GCODE
```
<small>trigger a gcode command.</small>
<br>
```c
- website: URL
```
<small>trigger a get request for a website.</small>
<br>
```c
- website_post: URL
```
<small>trigger a get post for a website.</small>

<br><br>
```console
[snapshot]
backend: sharp
before_snapshot_commands:
enable_before_snapshot_commands: false
delay_before_snapshot_commands: 0
after_snapshot_commands:
enable_after_snapshot_commands: false
delay_after_snapshot_commands: 0
```
<small>default configuration.</small>