// Initializes the `alert-trigger` service on path `/alert-trigger`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { AlertTrigger } from './alert-trigger.class';
import hooks from './alert-trigger.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'alert-trigger': AlertTrigger & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/alert-trigger', new AlertTrigger(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('alert-trigger');

  service.hooks(hooks);
}
