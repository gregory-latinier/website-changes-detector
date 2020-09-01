import { Application } from '../declarations';
import users from './users/users.service';
import urls from './urls/urls.service';
import monitoring from './monitoring/monitoring.service';
import alerts from './alerts/alerts.service';
import alertTrigger from './alert-trigger/alert-trigger.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(urls);
  app.configure(monitoring);
  app.configure(alerts);
  app.configure(alertTrigger);
}
