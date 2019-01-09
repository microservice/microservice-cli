# `omg subscribe` example
The [slack](https://github.com/microservice/slack) microservice is used for this example.

## Subscribing to an event
### Input
```
omg subscribe bot hears -a channel="CAL6YMP9C" -e BOT_TOKEN="xoxb-*********************"
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
✔ Started Docker container: d2595aff321f
✔ Health check passed
✔ Ran action: `bot` with output:
✔ Subscribed to event: `hears` data will be posted to this terminal window when appropriate
```

If the user interrupts with `^C` the service will be stopped:
```
✔ Stopped Docker container: d2595aff321f
```
