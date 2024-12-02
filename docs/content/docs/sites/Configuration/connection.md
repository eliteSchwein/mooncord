# [connection]

```c
moonraker_socket_url:
```
<small>websocket url for moonraker, only fill this when the socket url is different from moonraker_url.</small>
<br>  
```c
moonraker_url: http://127.0.0.1
```
<small>website url for moonraker.</small>  
<br>
```c
moonraker_token:
```
<small>moonraker api token, only fill this when you have force_logins enabled in your moonraker config.</small>  
<br>
```c
moonraker_retry_interval: 2
```
<small>reconnecting interval in seconds.</small>  
<br>
```c
bot_token: ASDASD12231ADASDA
```
<small>discord bot token, see [Preparations](/mooncord/install/#create-discord-application).</small>

<br><br>
```console
[connection]
moonraker_socket_url:
moonraker_url: http://127.0.0.1
moonraker_token:
moonraker_retry_interval: 2
bot_token:
```
<small>default configuration.</small>