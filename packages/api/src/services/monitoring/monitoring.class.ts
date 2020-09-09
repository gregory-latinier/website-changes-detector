/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { NotImplemented } from '@feathersjs/errors';
import { Application } from '../../declarations';
import { IUrl } from '../../models/urls.model';
import { IAlert } from '../../models/alerts.model';
// @ts-ignore
import jsLevenshtein from 'js-levenshtein';

// @ts-ignore
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';

import Twilio from 'twilio';
import sgMail from '@sendgrid/mail';

interface Data {}

interface ServiceOptions {}

export class Monitoring implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;
  browser: Browser | null;
  twilio: any;
  sendGrid: any;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.browser = null;
    this.twilio = Twilio(this.app.get('twilio').account, this.app.get('twilio').token);
    this.sendGrid = sgMail;
    this.sendGrid.setApiKey(this.app.get('sendGrid').key);

    if(!fs.existsSync(this.app.get('screenshotPath'))) {
      fs.mkdirSync(this.app.get('screenshotPath'), { recursive: true });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    try {
      if(!this.browser) {
        this.browser = await puppeteer.launch({args: ['--no-sandbox']});
      }
      const urls = await this.app.service('urls').find({ query: { active: true } }) as Paginated<IUrl>;
      if(urls.data.length) {
        // update the last check first
        for(const url of urls.data) {
          if(!url.lastCheck || url.lastCheck.getTime() <= Date.now() - url.frequency * url.frequencyUnit) {
            await this.app.service('urls').patch(url._id, { lastCheck: Date.now() });
          }
        }
        for(const url of urls.data) {
          // The Url can be check
          if(!url.lastCheck || url.lastCheck.getTime() <= Date.now() - url.frequency * url.frequencyUnit) {
            const page = await this.browser.newPage();
            const response = await page.goto(url.url);
            let sourceCode = '';
            let diff = 0;
            if(response) {
              sourceCode = await response.text();
              if(url.sourceCode) {
                diff = jsLevenshtein(url.sourceCode, sourceCode);
              }
              if(!url.sourceCode) {
                await this.app.service('urls').patch(url._id, { sourceCode });
              }
            }
            if(!fs.existsSync(`${this.app.get('screenshotPath')}/${url._id}.png`)) {
              await page.screenshot({
                path: `${this.app.get('screenshotPath')}/${url._id}.png`,
                fullPage: true
              });
            }
            if(diff > 100) {
              await this.app.service('urls').patch(url._id, { lastAlert: Date.now(), sourceCode });
              fs.unlinkSync(`${this.app.get('screenshotPath')}/${url._id}.png`);
              await page.screenshot({
                path: `${this.app.get('screenshotPath')}/${url._id}.png`,
                fullPage: true
              });
              const alerts = await this.app.service('alerts').find({ query: { active: true } }) as Paginated<IAlert>;
              if(alerts.data.length) {
                for (const alert of alerts.data) {
                  if(alert.type === 'sms') {
                    await this.twilio.messages.create({
                      from: this.app.get('twilio').number,
                      to: alert.value,
                      body: `Changement détecté sur ${url.title}: ${url.url}`
                    });
                  } else if(alert.type === 'email') {
                    const msg = {
                      to: alert.value,
                      from: this.app.get('sendGrid').sender,
                      subject: url.title,
                      text: `Changement détecté sur ${url.title}: ${url.url}`,
                      html: `Changement détecté sur <a href="${url.url}">${url.title}</a>`,
                    };
                    await sgMail.send(msg);
                  } else if(alert.type === 'whatsapp') {
                    await this.twilio.messages.create({
                      from: this.app.get('twilio').whatsapp,
                      to: alert.value,
                      body: `Changement détecté sur ${url.title}: ${url.url}`
                    });
                  }
                }
              }
            }

            await page.close();
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }
}
