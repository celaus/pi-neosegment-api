#FROM valentinvieriu/alpine-node-arm:latest
FROM arm32v6/alpine
ENV builddeps="npm node git make python gcc g++ libc-dev linux-headers"
RUN mkdir /app
RUN apk add --no-cache ${builddeps} && \
    git clone https://github.com/celaus/pi-neosegment-api /app && \
    cd /app && \
    npm install && \
    apk del ${builddeps} && \
    node_modules/typescript/bin/tsc

VOLUME /app/

EXPOSE 3000

WORKDIR /app

CMD ["node", "dist/index.js"]