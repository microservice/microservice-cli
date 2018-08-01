FROM node:9.7-alpine

RUN npm install omg -g

ENTRYPOINT ["omg"]
