FROM node:9.7-alpine

RUN npm install microservice-guide-cli -g

ENTRYPOINT ["microservice-guide-cli"]
