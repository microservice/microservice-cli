# `omg exec` example

## [command](https://microservice.guide/schema/interface/#command)
The [random](https://github.com/microservice/random) microservice is used for this example.

### Input
```
omg run string -a length=10
```

### Output
```
ℹ Building Docker image
Sending build context to Docker daemon  92.16kB
Step 1/3 : FROM node:alpine
 ---> 9036ebdbc59d
Step 2/3 : COPY cli.js /cli.js
 ---> Using cache
 ---> 8c1a98e887bf
Step 3/3 : COPY lib /lib
 ---> Using cache
 ---> 028aa209c4f8
Successfully built 028aa209c4f8
Successfully tagged omg/microservice/random:latest
✔ Built Docker image with name: omg/microservice/random
✔ Started Docker container: 99d7c66fa964
✔ Health check passed
✔ Ran action: `string` with output: sCTJmzmglh
✔ Stopped Docker container: 99d7c66fa964
```

## [http](https://microservice.guide/schema/interface/#http)
The [slack](https://github.com/microservice/slack) microservice is used for this example.

### Input
```
omg run list_channels -e BOT_TOKEN="xoxb-***************************"
```

### Output
```
ℹ Building Docker image
Sending build context to Docker daemon  214.5kB
Step 1/4 : FROM node:9.7-alpine
 ---> 2f9669a41a9f
Step 2/4 : RUN npm install @slack/client request
 ---> Using cache
 ---> a607508c6c1f
Step 3/4 : ADD app.js app.js
 ---> Using cache
 ---> f1014bf5ee44
Step 4/4 : ENTRYPOINT ["node", "app.js"]
 ---> Using cache
 ---> 78bb1cc7d8f0
Successfully built 78bb1cc7d8f0
Successfully tagged omg/microservice/slack:latest
✔ Built Docker image with name: omg/microservice/slack
✔ Started Docker container: f7517a661efe
✔ Health check passed
✔ Ran action: `list_channels` with output: [{
  "id": "CAJK0FL1W",
  "name": "random",
  "is_channel": true,
  ...
  "num_members": 3
}, {
  "id": "CAL6YMP9C",
  "name": "general",
  "is_channel": true,
  ...
  "num_members": 3
}]
✔ Stopped Docker container: f7517a661efe
```

## An action that has [events](https://microservice.guide/schema/events/)
[See](/docs/example-subscribe.md).
