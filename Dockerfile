FROM node:16-alpine as builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

FROM node:16-alpine

WORKDIR /app

RUN apk add --no-cache tini ffmpeg

# Since dist/ will not contain everything needed to run Mooncord, copy all of /app for now
COPY --from=builder /app/ /app/

USER node

ENTRYPOINT ["/tini", "--"]
CMD ["node", "/app/dist/index.js"]
