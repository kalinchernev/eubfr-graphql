# EUBFR GraphQL

This is a proxy service on top of Amazon Elasticsearch which lets you make queries through GraphQL endpoint and interfaces.

To be effective with this service, you will need to know the fundamentals of:

- [Elasticsearch](https://www.elastic.co/guide/index.html)
- [GraphQL](https://graphql.org/)

## Requirements

- Node.js (8.10.x recommended)
- yarn >= 1.x

It's recommended that you to use [Node Version Manager](https://github.com/creationix/nvm)

## Getting started

Setup your environment:

```sh
$ yarn install
```

Copy `.env.example` to `.env` and set your environment preferences.

### Local development

Start the project on your machine with a `watch` mode which will reload the code and the server on changes.

```sh
$ yarn develop
```

### Building dist

In order to keep the setup simple, you will need to still transpile the code and commit it with:

```sh
$ yarn build
```

### Start application

Start the built application with:

```sh
$ yarn start
```

This is the command used by AWS Elastic Beanstalk

## AWS Elastic Beanstalk

Code is deployed on AWS via Elastic Beanstalk service. Ensure you have the [CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) installed in order to be able to manage project settings.

When you have the CLI in your path, follow the [configuration options](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html?shortFooter=true) and

```sh
$ eb init
```

### Settings

Set environment varilables for the deployed project with [setenv](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-setenv.html):

```
$ eb setenv ES_TYPE=project
```

Get information about current settings:

```
$ eb printenv
```
