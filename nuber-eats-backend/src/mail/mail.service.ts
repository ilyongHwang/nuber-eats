import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface';

import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // this.sendEmail('testing', 'test').then(() => console.log(`success`)).catch(err => console.log(err.response));
  } // NestJS가 시작할 때 마다 이 함수를 테스트 하는 거얌!

  private async sendEmail(
      subject: string, 
      // to: string, // 돈내야해! ㅋㅋ
      template: string, 
      emailVars: EmailVar[],
    ) {
    //to도 넣을 수 있는데, credit 카드 등록이 필요함 ㅠㅠ
    const form = new FormData();
    form.append('from', `ilyong From Nuber Eats <mailgun@${this.options.domain}>`);
    // form.append('to', `${this.options.fromEmail}@${this.options.domain}`);
    form.append('to', `${this.options.fromEmail}`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
        await got(
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
    } catch (error) {
        console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
      this.sendEmail("Verify Your Email", "verifyemail", [
          { key: 'code', value: code },
          { key: 'username', value: email },
        ])
  }
}
