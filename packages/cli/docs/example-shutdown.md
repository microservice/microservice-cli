# `oms shutdown` example

## A microservice is running from an actions event
### Input
```
oms shutdown
```

### Output
```
✔ Microservice with container id: `871d4a17beb8` successfully shutdown
```

## Nothing is running
### Input
```
oms shutdown
```

### Output
```
ℹ Microservice not shutdown because it was not running
```
