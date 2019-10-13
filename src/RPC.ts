import { Channel } from 'amqplib';
import * as uuid from 'uuid';

export default class {
  private channel: Channel;

  public constructor(channel: Channel) {
    this.channel = channel;
  }

  public async call<T>(resource: string, message: T): Promise<T> {
    const queue = await this.channel.assertQueue('', { exclusive: true });
    const correlationId = uuid.v4();

    return new Promise(resolve => {
      this.channel.consume(
        queue.queue,
        response => {
          if (response!.properties.correlationId === correlationId) {
            resolve(
              response &&
                response.content &&
                JSON.parse(response.content.toString())
            );
          }
        },
        { noAck: true }
      );

      this.channel.sendToQueue(resource, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: queue.queue,
      });
    });
  }

  public async serve<T>(
    resource: string,
    callback: (arg: T) => any
  ): Promise<void> {
    await this.channel.assertQueue(resource);
    await this.channel.prefetch(1);

    await this.channel.consume(resource, async message => {
      const response = await callback(
        message && message.content && JSON.parse(message.content.toString())
      );

      this.channel.sendToQueue(
        message!.properties.replyTo,
        Buffer.from(JSON.stringify(response)),
        { correlationId: message!.properties.correlationId }
      );

      this.channel.ack(message!);
    });
  }
}
