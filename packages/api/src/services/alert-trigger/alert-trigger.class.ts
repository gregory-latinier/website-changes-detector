import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import Twilio from 'twilio';
import sgMail from '@sendgrid/mail';

interface Data {}

interface ServiceOptions {}

export class AlertTrigger implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;
  twilio: any;
  sendGrid: any;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.twilio = Twilio(this.app.get('twilio').account, this.app.get('twilio').token);
    this.sendGrid = sgMail;
    this.sendGrid.setApiKey(this.app.get('sendGrid').key);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    const alert = await this.app.service('alerts').get(id);
    if(alert.type === 'sms') {
      const result = await this.twilio.messages.create({
        from: this.app.get('twilio').number,
        to: alert.value,
        body: 'Alert test'
      });
      console.log(result);
    } else if(alert.type === 'email') {
      const msg = {
        to: alert.value,
        from: this.app.get('sendGrid').sender,
        subject: 'Alert test',
        text: 'Alert test',
        html: 'Alert test',
      };
      try {
        await sgMail.send(msg);
      } catch (e) {
        console.log(e);
      }
    } else if(alert.type === 'whatsapp') {
      const result = await this.twilio.messages.create({
        from: this.app.get('twilio').whatsapp,
        to: alert.value,
        body: 'Alert test'
      });
      console.log(result);
    }
    return {
      success: true
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
