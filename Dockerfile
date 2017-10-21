FROM valentinvieriu/alpine-node-arm:latest
RUN mkdir /app
COPY dist /app/

VOLUME /app/

EXPOSE 3000

WORKDIR /app

CMD ["node", "dist/index.js"]