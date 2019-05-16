# OMG APP

[![CircleCI](https://img.shields.io/circleci/project/github/microservices/omg/master.svg?style=for-the-badge)](https://circleci.com/gh/microservices/omg-cli/tree/master)

## About lerna

This project uses [lerna](https://github.com/lerna/lerna) to manage packages.
Thanks to lerna you can run commands available in all packages using `lerna run <command>`.

## Project setup

```bash
# Install lerna
$> npm install

# Install the packages dependencies
$> npm run bootstrap
```

## Compiles and minifies all packages for production

```bash
$> lerna run build
```

## Lint all packages

```bash
$> lerna run lint
```

## Test all packages

```
$> lerna run test
```

## Coverage on all packages

```
$> lerna run coverage
```

## Publish all packages that need to be published

```
$> npm run publish
```

## Automatic version bump

This script bumps the version of all packages using [conventional commit](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#type) types.
This script does not created nor push git tags.

```
$> npm run bump
```

If you want to manually bump the packages version, you can use `lerna version`.

## Make an alias

```bash
# Making an alias is usefull to prevent using the real `omg` package when installed locally
$> alias omg=~/path/to/omg/omg
```
