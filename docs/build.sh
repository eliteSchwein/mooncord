#!/bin/bash

docker run --rm -it -v ${PWD}/content:/docs squidfunk/mkdocs-material build

sudo chown -R $(id -u):$(id -g) content/site