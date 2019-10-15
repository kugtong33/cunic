import assert from 'assert';
import sinon, { SinonSpy } from 'sinon';
import R from 'ramda';
import { delay } from 'highoutput-utilities';
import Cunic from '../src';

describe('Publisher', async () => {
  const cunic = new Cunic();

  before(async () => {
    await cunic.connect();
  });

  after(async () => {
    await cunic.disconnect();
  });

  it('should be able to publish messages', async () => {
    const pubsub = cunic.createPubSub();
    const callback = sinon.fake();
    const message = {
      username: 'email@local.host',
      password: 'asdfads',
      name: 'John',
    };

    await pubsub.subscribe<object>('account.command.create', callback);
    await pubsub.publish('account.command.create', message);

    await delay('100ms');

    assert.deepEqual(callback.args[0][0], message);
    assert.ok(callback.calledOnce);
  });

  it('should be able to publish multiple messages', async () => {
    const pubsub = cunic.createPubSub();
    const callback = sinon.fake();
    const message = {
      username: 'email@local.host',
      password: 'asdfads',
      name: 'John',
    };

    await pubsub.subscribe<object>('account.command.update', callback);

    R.times(() => {
      pubsub.publish('account.command.update', message);
    })(100);

    await delay('100ms');

    assert.equal(callback.callCount, 100);
  });

  it('should be able to publish multiple messages on all subscribers', async () => {
    const pubsub = cunic.createPubSub();
    const callbacks: SinonSpy<any[], any>[] = [];
    const message = {
      username: 'email@local.host',
      password: 'asdfads',
      name: 'John',
    };

    await Promise.all(
      R.times(async () => {
        const callback = sinon.fake();
        await pubsub.subscribe<object>('account.command.retrieve', callback);
        callbacks.push(callback);
      })(10)
    );

    R.times(() => {
      pubsub.publish('account.command.retrieve', message);
    })(10);

    await delay('1s');

    R.map((callback: SinonSpy<any[], any>) => {
      return assert.equal(callback.callCount, 10);
    })(callbacks);
  });
});
