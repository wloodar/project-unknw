import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation() {
        const token = "testtoken";

        const url = `localhost:3000/auth/confirm-email?token=${token}`;
    
        await this.mailerService.sendMail({
            to: "kubawlodarczyk13@gmail.com",
            // from:
            subject: "Welcome to unknw project! Please confirm your Email",
            template: './templates/confirmation.hbs',
            context: {
                name: "Wlodar",
                url
            }
        });
    }
}
