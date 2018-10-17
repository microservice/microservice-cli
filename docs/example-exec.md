# `omg exec` example

## [command](https://microservice.guide/schema/interface/#command)
The [random](https://github.com/microservice/random) microservice is used for this example.

### Input
```
omg exec string -a length=10
```

### Output
```
✔ Built Docker image with name: omg/microservice/random
✔ Ran action: `string` with output: 7LUeExa0OT
```

## [http](https://microservice.guide/schema/interface/#http)
The [slack](https://github.com/microservice/slack) microservice is used for this example.

### Input
```
omg exec list_channels -e BOT_TOKEN="xoxb-***************************"
```

### Output
```
✔ Built Docker image with name: omg/microservice/slack
✔ Stared Docker container with id: 77e8a383eb56
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
✔ Stopped Docker container: 77e8a383eb56
```

## Other
### `--image`, or `-i` flag
If you alread have an image, use the `-i` flag.

#### Input
```
omg exec -i rand string -a length=10
```

#### Output
```
✔ Ran action: `string` with output: ePLJcaopEw
```
