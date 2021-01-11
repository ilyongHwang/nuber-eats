import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interface';

import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('testing', 'test').then(() => console.log(`success`)).catch(err => console.log(err.response));
  } // NestJS가 시작할 때 마다 이 함수를 테스트 하는 거얌!

  private async sendEmail(subject: string, template: string) {
    //to도 넣을 수 있는데, credit 카드 등록이 필요함 ㅠㅠ
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    // form.append('to', `${this.options.fromEmail}@${this.options.domain}`);
    form.append('to', `${this.options.fromEmail}`);
    form.append('subject', subject);
    form.append('template', template);
    form.append('v:code', 'asdasdasdsa');
    form.append('v:username', 'nico!!');

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    );
    console.log(response.body);
  }
}
