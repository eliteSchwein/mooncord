# [embed NAME]

!!! warning
    the configuration is for advanced users only.

!!! danger
    the configuration for embeds is complicated. very complicated, only touch the configuration if you are 100% sure that you know what you are doing. if you missconfigure something the bot will break. **there are no fallbacks.**

```c
color: COLOR
```
<small>Color Hex Code without #.</small>  
<br>
```c
image: IMAGE
```

| Name              | Description                                              |
|-------------------|----------------------------------------------------------|
| webcam            | use the current active webcam as picture                 |
| placeholderWebcam | use the webcam placeholder image                         |
| thumbnail         | use the current printjob (or context printjob) thumbnail |
| tempGraph         | use the temp graph image                                 |
| historyGraph      | use the history graph image                              |
| excludeGraph      | use the exclude graph image                              |
| *.png             | use a image from the assets                              |

<br>
```c
footer: FOOTER
```
<small>footer of the embed (you can also use unicode icons).</small>  
<br>
```c
timestamp: true
```
<small>show the timestamp of the embed.</small>  
<br>
```console
select_menus: 
- SELECTION
```
<small>add select menu(es) to the embed.</small>  
<br>
```console
buttons: 
- BUTTON
```
<small>add button(s) to the embed.</small>  
<br>
```c
buttons_per_row: 5
```
<small>buttons per row (default is 5, some embeds use 3).</small>  
<br>
fields:
```console
field1_name: NAME
field1_value: VALUE
field2_name: NAME
field2_value: VALUE
```
<small>add fields to the embed.</small>  
<br>
```console
partials: 
- PARTIAL
```

| Name            | Description                   |
|-----------------|-------------------------------|
| version         | use the version partial       |
| spoolman        | use the spoolman partial      |
| updates         | use the updates partial       |
| temp(s)         | use the temp partial          |
| minimal_temp(s) | use the minified temp partial |
| print_history   | use the print history partial |
| power_devices   | use the power devices partial |  

<small>add partials to the embed. partials are coded partial embeds (for example some fields).</small>  
<br><br>  

!!! warning
    the configuration below is merged from the locale.

```c
description: DESCRIPTION
```
<small>description of the embed (you can also use unicode icons and some discord markdown).</small>  
<br>
```c
content: CONTENT
```
<small>content of the embed.</small>  
<br>
```c
title: TITLE
```
<small>title of the embed.</small>  
<br>
```c
activity: ACTIVITY
```
<small>activity message (in custom mode it also supports unicode icons, you set the type in [[status]](/mooncord/sites/Configuration/Advanced/Embed/status/)).</small>

<br><br>
```console
[embed shutdown]
content: 'Klipper firmware has a shutdown!'
title: 'Klipper Shutdown'
activity: '⚠️ klipper shutdown!'
color: '${theme.shutdown}'
image: webcam
footer: '🕑'
timestamp: true
description: ```${state_message}```
select_menus:
- status_webcam
buttons:
- klipper_restart
```
<small>shutdown configuration merged with locale as reference.</small>