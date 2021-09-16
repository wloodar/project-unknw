import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendForgottenPassword(sendTo: string, subject: string, token: string) {
        
        await this.mailerService.sendMail({
            to: "kubawlodarczyk13@gmail.com",
            // from:
            subject: subject,
            template: './templates/forgottenPassword.hbs',
            context: {
                token
            }
        });

        return true;
    }
}
