import { HookContext } from '@feathersjs/feathers';
import { Forbidden } from '@feathersjs/errors';

export default {
  before: {
    all: [],
    find: [(context: HookContext) => {
      if(!context.params.query || context.params.query.apiInternalKey !== context.app.get('APIInternalKey')) {
        throw new Forbidden('Not allowed');
      }
    }],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
