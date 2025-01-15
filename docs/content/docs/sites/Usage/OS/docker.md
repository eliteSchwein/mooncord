# docker usage

!!! warning
    the docker image is experimentell. this is the first time that i make a docker image, i got some help from ChatGPT.

!!! info
    if you dont want to use docker compose, you are on your own.

you can use the offical [docker image](https://hub.docker.com/repository/docker/tludwigdev/mooncord/general).

here is a example configuration:

```yaml
services:
  mooncord:
    restart: unless-stopped
    image: tludwigdev/mooncord:latest
    volumes:
      - /home/hostuser/config/:/config/
```

for the first start pls run just `docker compose up`, this will generate a docker optimized default configuration.

replace in the config `MOONRAKER_URL` with the ip address or hostname of your printer.  
replace in the config `DISCORD_BOT_TOKEN` with your discord bot token.  
replace in the config `MOONRAKER_TOKEN/API_KEY REMOVE_IF_NOT_PRESENT` with your moonraker api key/token, if not present just replace the whole line with `moonraker_token: ''`.

after that run `docker compose up -d`.