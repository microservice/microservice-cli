# `omg subscribe` example
The [slack](https://github.com/microservice/slack) microservice is used for this example.

## Subscribing to an event
### Input
```
omg subscribe hears -a channel="CAL6YMP9C"
```

### Output
```
✔ Subscribed to event: `hears` data will be posted to this terminal window when appropriate
```

## Trying to subscribe to an event who's action was not ran
### Input
```
omg subscribe hears -a channel="CAL6YMP9C"
```

### Output
```
✖ Failed subscribing to event: `hears`. You must run `omg exec `action_for_event`` before trying to subscribe to an event
```
