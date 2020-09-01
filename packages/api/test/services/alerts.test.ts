import assert from 'assert';
import app from '../../src/app';

describe('\'alerts\' service', () => {
  it('registered the service', () => {
    const service = app.service('alerts');

    assert.ok(service, 'Registered the service');
  });
});
