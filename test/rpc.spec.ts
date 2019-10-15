import assert from 'assert';
import * as R from 'ramda';
import sinon from 'sinon';
import { delay } from 'highoutput-utilities';
import Cunic from '../src';

describe('RPC', async () => {
  const cunic = new Cunic();

  before(async () => {
    await cunic.connect();
  });

  after(async () => {
    await cunic.disconnect();
  });

  it('should be able to call a remote procedure', async () => {
    const rpc = cunic.createRPC();
    const message = { username: 'email@local.host' };
    const returnMessage = { deleted: true };
    const callback = sinon.fake.returns(returnMessage);

    await rpc.serve<object>('account.command.delete', callback);
    const response = await rpc.call('account.command.delete', message);

    await delay('100ms');

    assert.ok(callback.calledOnce);
    assert.deepEqual(callback.args[0][0], message);
    assert.deepEqual(response, returnMessage);
  });

  it('should be able to call remote procedure multiple times', async () => {
    const rpc = cunic.createRPC();
    const message = { username: 'email@local.host' };
    const callback = sinon.fake.returns({ deleted: true });

    await rpc.serve<object>('account.command.disable', callback);

    await Promise.all(
      R.times(async () => {
        await rpc.call('account.command.disable', message);
      })(100)
    );

    assert.equal(callback.callCount, 100);
    assert.deepEqual(callback.args[0][0], message);
  });
});
