


## What is ASK SDK for Node.js?

The ASK SDK v2 for Node.js is an open-source Alexa CustomSkill Development Kit. ASK SDK v2 for Node.js makes it easier for you to build highly engaging skills, by allowing you to spend more time on implementing features and less on writing boiler-plate code.

## What is the ASK SDK PostgreSQL Persistence Adapter?

The ASK SDK PostgreSQL Persistence Adapter package contains implementation of the persistence adapter in Core SDK ('ask-sdk-core') based on AWS SDK. This package allows you to quickly get started in developing your custom Alexa Skill and easily manage persistence attributes throughout the skill with your own PostgreSQL database if that is your preferred database to work with.

If interested, you can find implementations for non-relational databases here instead:
  - [ASK SDK DynamoDB Persistence Adapter](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter) (made by the Amazon Alexa team)
  - [ASK SDK MongoDB Persistence Adapter](https://www.npmjs.com/package/ask-sdk-mongodb-persistence-adapter) (made by [xavidop](https://github.com/xavidop))

## Installing
ASK SDK PostgreSQL Persistence Adapter package is an addon package for the core SDK ('ask-sdk-core') and thus has peer dependency of the core SDK package. From within your NPM project, run the following commands in the terminal to install them:

```
npm install --save ask-sdk-postgresql-persistence-adapter
```

## Usage and Getting Started

This package uses [node-postgres](https://node-postgres.com/) to establish either a client or pool connection by importing either a PgClientConnection or PgPoolConnection along with the persistence adapter. It is recommended that you use a pool connection for your skill. You can read more about pooling and why you should use it [here](https://node-postgres.com/).





1. Example on how to implement via pooling (recommended method):

```javascript
let { PostgreSQLPersistenceAdapter, PgPoolConnection } = require('ask-sdk-postgresql-persistence-adapter');

const poolConnection = new PgPoolConnection({
  user: 'postgres_db_user',
  host: 'postgres_host',
  password: 'postgres_password',
  port: postgres_port
})

const options = {
  tableName: 'myTable',
  connection: poolConnection
}

const persistenceAdapter = new PostgreSQLPersistenceAdapter(options);

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
  .withPersistenceAdapter(persistenceAdapter)
  .lambda();
```

2. Example on how to implement via client:

```javascript
let { PostgreSQLPersistenceAdapter, PgClientConnection } = require('ask-sdk-postgresql-persistence-adapter');

const clientConnection = new PgClientConnection({
  user: 'postgres_db_user',
  host: 'postgres_host',
  password: 'postgres_password',
  port: postgres_port
})

const options = {
  tableName: 'myTable',
  connection: clientConnection
}

const persistenceAdapter = new PostgreSQLPersistenceAdapter(options);

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
  .withPersistenceAdapter(persistenceAdapter)
  .lambda();
```

Full PostgreSQLPersistenceAdapter parameter options:
- `tableName` (string) - The name of a PostgreSQL table used. If the table is not yet created, the PostgreSQLPersistenceAdapter will create it for you in your database.
- `partitionKeyName` (string) - Optional. The name of the partition key column. Default to "id" if not provided.
- `attributesName` (string) - Optional.  The name of the attributes column. Default to "attributes" if not provided.
- `partitionKeyGenerator` (function) - Optional. The function used to generate partition key using RequestEnvelope. Default to generate the partition key using the userId.
- `connection` (PostgreSQLConnection) - The desired connection to query the PostgreSQL database. Use either PgPoolConnection (recommended) or PgClientConnection.;

PgPoolConnection and PgClientConnection parameter config options are of type pg.PoolConfig and pg.ClientConfig:
- Read more about [pg.Client](https://node-postgres.com/apis/client) and [pg.Pool](https://node-postgres.com/apis/pool) parameter options.


## Usage with TypeScript
The ASK SDK MongoDB Persistence Adapter package for Node.js bundles TypeScript definition files for use in TypeScript projects and to support tools that can read .d.ts files. The goal is to keep these TypeScript definition files updated with each release for any public api.

### Pre-requisites
Before you can begin using these TypeScript definitions with your project, you need to make sure your project meets a few of these requirements:
- Use TypeScript v2.x
- Includes the TypeScript definitions for node. You can use npm to install this by typing the following into a terminal window:

```
npm install --save-dev @types/node
```

### In Node.js
To use the TypeScript definition files within a Node.js project, simply import ask-sdk-mongodb-persistence-adapter as below:

In a TypeScript file:

```typescript
import * as Adapter from 'ask-sdk-postgresql-persistence-adapter';
```

In a JavaScript file:

```javascript
const Adapter = require('ask-sdk-postgresql-persistence-adapter');
```

## Opening Issues
For bug reports, feature requests and questions, we would like to hear about it. Search the [existing issues](https://github.com/bryanleemoore/ask-sdk-postgresql-persistence-adapter/issues) and try to make sure your problem doesn’t already exist before opening a new issue. It’s helpful if you include the version of the SDK, Node.js or browser environment and OS you’re using. Please include a stack trace and reduced repro case when appropriate, too. 

## Contributions
If you would like to make a contribution, feel free to make a issue, make a pull request and link the issue. 

## License
This adapter is distributed under the Apache License, Version 2.0, see LICENSE for more information.
