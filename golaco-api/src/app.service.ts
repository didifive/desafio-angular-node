import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

const logger = new Logger('GolacoAPI');

const colorYellow = '\x1b[33m';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    let banner = '';
    try {
      banner = readFileSync(join(__dirname, 'resources', 'banner.txt'), 'utf8');
    } catch (error) {
      logger.error(error);
    }
    if (banner) console.log(colorYellow, banner.toString());
  }
  getHello(): string {
    return 'Hello World!';
  }
}
