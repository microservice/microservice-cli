# Open Microservices CLI

> Welcome to Open Microservices CLI project! If you're just getting started, check out [openmicroservices.org][website] to see what it's all about.

[![CircleCI](https://circleci.com/gh/microservices/oms.svg?style=svg)](https://circleci.com/gh/microservices/oms)
[![Spectrum Chat](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/open-microservices)
[![npm version](https://img.shields.io/npm/v/@microservices/oms)](https://img.shields.io/npm/v/@microservices/oms)
[![NPM downloads](https://img.shields.io/npm/dm/@microservices/oms.svg)](https://www.npmjs.com/package/@microservices/oms)
[![Renovate badge](https://badges.renovateapi.com/github/microservices/oms)](https://renovatebot.com/)

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

All suggestions in how to improve the CLI are very welcome. Feel free share your thoughts in the Issue tracker, or even better, fork the repository to implement your own ideas and submit a pull request.

This project is guided by [Contributor Covenant](https://github.com/microservices/.github/blob/master/CODE_OF_CONDUCT.md). Please read out full [Contribution Guidelines](https://github.com/microservices/.github/blob/master/CONTRIBUTING.md).

#### Getting Started

After cloning this repository, open up a shell in this project's root directory and execute the following to build from source:

``` sh
yarn bootstrap
yarn link
yarn build
```

If you're editing the raw Typescript files you can take advantage of live transpilation with the following:

``` sh
yarn watch
```

### Additional Resources

* [Install the CLI](https://github.com/microservices/oms) - The OMS CLI helps developers create, test, validate, and build microservices.
* [Example OMS Services](https://github.com/oms-services) - Examples of OMS-compliant services written in a variety of languages.
* [Example Language Implementations](https://github.com/microservices) - Find tooling & language implementations in Node, Python, Scala, Java, Clojure.
* [Storyscript Hub](https://hub.storyscript.io) - A public registry of OMS services.
* [Community Chat](https://spectrum.chat/open-microservices) - Have ideas? Question? Join us on Spectrum.

### License

This project is licensed under the terms of the MIT License. See the LICENSE file in the repository for more information.

[website]:https://openmicroservices.org/
