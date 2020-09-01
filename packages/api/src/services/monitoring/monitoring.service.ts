// Initializes the `monitoring` service on path `/monitoring`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Monitoring } from './monitoring.class';
import hooks from './monitoring.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'monitoring': Monitoring & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/monitoring', new Monitoring(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('monitoring');

  service.hooks(hooks);
}
