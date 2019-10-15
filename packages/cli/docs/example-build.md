# `oms build` example

The [random](https://github.com/microservice/random) microservice is used for this example.

## Vanila

### Input
```
oms build
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
Successfully tagged oms/microservice/random:latest
✔ Built Docker image with name: oms/microservice/random
```

## `--tag`, or`-t` flag

### Input
```
oms build -t rand
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
Successfully tagged rand:latest
✔ Built Docker image with name: rand
```
