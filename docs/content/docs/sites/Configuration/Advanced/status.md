# [status]

!!! warning
    the configuration is for advanced users only.

```c
use_percent: true
```
<small>use percent as interval for the automatic status messages.</small>  
<br>
```c
update_interval: 10
```
<small>interval of the automatic status messages in seconds or percent (if use_percent is active).</small>  
<br>
```c
cooldown: 5
```
<small>cooldown for automatic status messages.</small>  
<br>
```c
min_interval: 15
```
<small>minimum interval between automatic status messages.</small>  
<br>
```c
gcode_timeout: 600
```
<small>timeout for triggered gcode (for example macro button or snapshot command).</small>

<br><br>
```console
[status]
update_interval: 10
use_percent: true
cooldown: 5
min_interval: 15
gcode_timeout: 600
```
<small>default configuration.</small>