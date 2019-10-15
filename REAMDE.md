# Cunic

This is a simple rabbitmq wrapper with specific messaging patterns, **pubsub** and **rpc**.

```shell
npm install cunic
```

## Getting Started
----
```typescript
import Cunic from 'cunic';

const cunic = new Cunic();

cunic.connect().then(async () => {
  const pubsub = await cunic.createPubSub();

  /* subscribe to an amqp exchange */
  await pubsub.subscribe('api.account.create', (message) => { console.log(`pubsub: received ${message}`); });


  /* publish to an amqp exchange */
  await pubsub.publish('api.account.create', () => ({ message: 'ping' }));
});
```

The API is simple, this is an ongoing experiment, and usage is simple as well.

## API
----

#### Cunic()

The constructor accepts a single parameter, `hostname`. Default value is `amqp://localhost`.

#### Cunic.connect()

Initializes the connection and channel.

#### Cunic.disconnect()

Closes the connection and channel.

### PubSub

Amqp wrapper for the Pub/Sub pattern.

#### PubSub.subscribe()

Subscribe to an exchange using the string input as exchange name.

#### PubSub.publish()

Publish to the exchange using the string input as exchange name, all subscribers will receive the message.

### RPC

Amqp wrapper for the RPC pattern.

#### RPC.serve()

RPC Queue server using the string input as queue name. Each queue server has its dedicated queue.

#### RPC.call()

Calls a remote procedure using the string input as queue name.

