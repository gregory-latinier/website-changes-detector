/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { NotImplemented } from '@feathersjs/errors';
import { Application } from '../../declarations';
import { IUrl } from '../../models/urls.model';

// @ts-ignore
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
// @ts-ignore
import { PNG } from 'pngjs';
// @ts-ignore
import pixelmatch from 'pixelmatch';

interface Data {}

interface ServiceOptions {}

export class Monitoring implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;
  browser: Browser | null;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.browser = null;
    if(!fs.existsSync(this.app.get('screenshotPath'))) {
      fs.mkdirSync(this.app.get('screenshotPath'), { recursive: true });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    if(!this.browser) {
      this.browser = await puppeteer.launch();
    }
    const urls = await this.app.service('urls').find({ query: { active: true } }) as Paginated<IUrl>;
    if(urls.data.length) {
      for(const url of urls.data) {
        // The Url can be check
        if(!url.lastCheck || url.lastCheck.getTime() <= Date.now() - url.frequency * url.frequencyUnit) {
          await this.app.service('urls').patch(url._id, { lastCheck: Date.now() });
          const page = await this.browser.newPage();
          await page.goto(url.url);
          await page.screenshot({path: `${this.app.get('screenshotPath')}/${url._id}-new.png`});
          if(!fs.existsSync(`${this.app.get('screenshotPath')}/${url._id}.png`)) {
            fs.renameSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`, `${this.app.get('screenshotPath')}/${url._id}.png`);
          } else {
            const newImg = PNG.sync.read(fs.readFileSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`));
            const oldImg = PNG.sync.read(fs.readFileSync(`${this.app.get('screenshotPath')}/${url._id}.png`));
            const diff = pixelmatch(newImg.data, oldImg.data, null, 800, 600, { threshold: 0.1 });
            if(diff > 0) {
              await this.app.service('urls').patch(url._id, { lastAlert: Date.now() });
              fs.unlinkSync(`${this.app.get('screenshotPath')}/${url._id}.png`);
              fs.renameSync(`${this.app.get('screenshotPath')}/${url._id}-new.png`, `${this.app.get('screenshotPath')}/${url._id}.png`);
            }
          }

          await page.close();
        }
      }
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