# `omg shutdown` example

## A microservice is running from an actions event
### Input
```
omg shutdown
```

### Output
```
✔ Microservice with container id: `871d4a17beb8` successfully shutdown
```

## Nothing is running
### Input
```
omg shutdown
```

### Output
```
ℹ Microservice not shutdown because it was not running
```
