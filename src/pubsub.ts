import { Channel } from 'amqplib';

export default class PubSub {
  private channel: Channel;

  public constructor(channel: Channel) {
    this.channel = channel;
  }

  public async publish<T>(resource: string, message: T): Promise<void> {
    await this.channel.assertExchange(resource, 'fanout');
    this.channel.publish(resource, '', Buffer.from(JSON.stringify(message)));
  }

  public async subscribe<T>(
    resource: string,
    callback: (arg: T) => any
  ): Promise<void> {
    await this.channel.assertExchange(resource, 'fanout');

    const queue = await this.channel.assertQueue('', { exclusive: true });

    await this.channel.bindQueue(queue.queue, resource, '');
    await this.channel.consume(
      queue.queue,
      async message => {
        await callback(
          message && message.content && JSON.parse(message.content.toString())
        );
      },
      { noAck: true }
    );
  }
}
