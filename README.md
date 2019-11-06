# Open Microservices CLI

Welcome to Open Microservices CLI project! If you're just getting started, check out [openmicroservices.org][website] to see what it's all about.

### Installation

If you're using `yarn`:

``` sh
yarn global add @microservices/oms
```

Or if you're using `npm`:

``` sh
npm i @microservices/oms -g
```

### Usage

[![Open Microservices CLI](https://raw.githubusercontent.com/microservices/oms/master/.github/oms-cli-usage-carbon.png)](https://raw.githubusercontent.com/microservices/oms/master/.github/oms-cli-usage-carbon.png)

### Contributing

After cloning this repository, open up a shell in repo directory and execute the following

``` sh
yarn bootstrap
yarn link
yarn build
```

When working on the sources and want your changes to be transpiled as you work on them, do:

``` sh
yarn watch
```

### License

OMS packages including the CLI, the UI package and the Validation package are licensed under the terms of the MIT License.
See the LICENSE file in the repository for more information.

[website]:https://openmicroservices.org/
