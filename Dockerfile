#FROM valentinvieriu/alpine-node-arm:latest
FROM arm32v6/alpine

ENV builddeps="npm git make python3 gcc g++ libc-dev linux-headers"

RUN mkdir /app

RUN apk add --no-cache ${builddeps} nodejs

RUN git clone -d1 https://github.com/celaus/pi-neosegment-api /app \ 
    && cd /app \
    && CPLUS_INCLUDE_PATH=node_modules/nan npm install \
    && node_modules/typescript/bin/tsc

RUN apk del ${builddeps}
    
VOLUME /app/

EXPOSE 3000

WORKDIR /app

CMD ["node", "dist/index.js"]