# [webcam NAME]

!!! info
    this is optional, per default MoonCord will use the webcams that you configure via webinterface (Mainsail for example).  
    any webcam that you configure in the mooncord.cfg will be only available with MoonCord and will be added to the webcam selection.

`url: http://example.org/webcam/snapshot`  
<small>url to a static image (snapshot).</small>  

`rotation: 0`  
<small>rotation of the image in degrees (recommended 0,90,180,360). Inactive when flip_horizontal and flip_vertical is active.</small>

`flip_horizontal: false`  
<small>flip the image horizontal.</small>

`flip_vertical: false`  
<small>flip the image vertical.</small>

<br><br>
```console
[webcam NAME]
url: http://example.org/webcam/snapshot
rotation: 0
flip_vertical: false
flip_horizontal: false
```
<small>default configuration.</small>