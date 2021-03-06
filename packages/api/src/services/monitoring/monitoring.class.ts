/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { NotImplemented } from '@feathersjs/errors';
import { Application } from '../../declarations';
import { IUrl } from '../../models/urls.model';
import { IAlert } from '../../models/alerts.model';

// @ts-ignore
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
// @ts-ignore
import { PNG } from 'pngjs';
// @ts-ignore
import pixelmatch from 'pixelmatch';

import Twilio from 'twilio';
import sgMail from '@sendgrid/mail';

interface Data {}

interface ServiceOptions {}

async function autoScroll(page: any){
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

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
        this.browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      }
      const urls = await this.app.service('urls').find({ query: { active: true } }) as Paginated<IUrl>;
      if(urls.data.length) {
        for await(const url of urls.data) {
          // The Url can be check
          if(!url.lastCheck || url.lastCheck.getTime() <= Date.now() - url.frequency * url.frequencyUnit) {
            await this.app.service('urls').patch(url._id, { lastCheck: Date.now() });
            const page = await this.browser.newPage();
            await page.goto(url.url, {
              waitUntil: 'networkidle0'
            });
            await page.setViewport({
              width: 1200,
              height: 800
            });

            await autoScroll(page);

            await page.screenshot({
              path: `${this.app.get('screenshotPath')}/${url._id}-new.png`,
              fullPage: true
            });
            await page.close();
            if(!fs.existsSync(`${this.app.get('screenshotPath')}/${url._id}.png`)) {
              fs.renameSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`, `${this.app.get('screenshotPath')}/${url._id}.png`);
            } else {
              const newImg = PNG.sync.read(fs.readFileSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`));
              const oldImg = PNG.sync.read(fs.readFileSync(`${this.app.get('screenshotPath')}/${url._id}.png`));
              let diff = 0;
              try {
                diff = pixelmatch(newImg.data, oldImg.data, null, newImg.width, newImg.height, { threshold: 0.1 });
              } catch (e) {
                diff = 100;
              }
              if(diff > 0) {
                // Compare with cloudflare
                const cloudflareRef = PNG.sync.read(fs.readFileSync(`${this.app.get('screenshotPath')}/../cloudflare.png`));
                if(newImg.width === cloudflareRef.width && newImg.height === cloudflareRef.height) {
                  diff = pixelmatch(newImg.data, cloudflareRef.data, null, newImg.width, newImg.height, { threshold: 0.1 });
                  if(diff === 0) {
                    return [];
                  }
                }
                await this.app.service('urls').patch(url._id, { lastAlert: Date.now() });
                if(fs.existsSync(`${this.app.get('screenshotPath')}/${url._id}-comp1.png`)) {
                  fs.unlinkSync(`${this.app.get('screenshotPath')}/${url._id}-comp1.png`);
                }
                if(fs.existsSync(`${this.app.get('screenshotPath')}/${url._id}-comp2.png`)) {
                  fs.unlinkSync(`${this.app.get('screenshotPath')}/${url._id}-comp2.png`);
                }
                fs.copyFileSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`, `${this.app.get('screenshotPath')}/${url._id}-comp1.png`);
                fs.copyFileSync(`${this.app.get('screenshotPath')}/${url._id}.png`, `${this.app.get('screenshotPath')}/${url._id}-comp2.png`);
                fs.unlinkSync(`${this.app.get('screenshotPath')}/${url._id}.png`);
                fs.renameSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`, `${this.app.get('screenshotPath')}/${url._id}.png`);

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
                        html: `Changement détecté sur <a href="${url.url}">${url.title}</a><br /> Base 1<br /><img src="http://wcd.mentalhackers.org/screenshots/${url._id}-comp1.png"/><br /> Base 2<br /><img src="http://wcd.mentalhackers.org/screenshots/${url._id}-comp2.png"/>`,
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
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    this.app.service('monitoring').find({ query: { apiInternalKey: process.env.INTERNAL_API_KEY } });
    // monitoring?apiInternalKey=${process.env.INTERNAL_API_KEY}`);
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
