# docker usage

!!! warning
    the docker image is experimentell. this is the first time that i make a docker image, i got some help from ChatGPT.

you can use the offical [docker image](https://hub.docker.com/repository/docker/tludwigdev/mooncord/general).

here is a example configuration:

```yaml
services:
  mooncord:
    image: tludwigdev/mooncord:latest
    volumes:
      - /home/hostuser/config/:/config/
```