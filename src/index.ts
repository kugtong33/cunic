import amqplib, { Connection, Channel } from 'amqplib';
import PubSub from './pubsub';
import RPC from './rpc';

export default class {
  private hostname: string;
  private connection?: Connection;
  private channel?: Channel;

  constructor(hostname?: string) {
    this.hostname = hostname || 'amqp://localhost';
    this.connection = undefined;
    this.channel = undefined;
  }

  async connect(): Promise<void> {
    this.connection = await amqplib.connect(this.hostname);
    this.channel = await this.connection.createChannel();
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  }

  createPubSub(): PubSub | never {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }

    return new PubSub(this.channel);
  }

  createRPC(): RPC | never {
    if (!this.channel) {
      throw new Error('Channel is not initialized');
    }

    return new RPC(this.channel);
  }
}
