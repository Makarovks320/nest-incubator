import { Injectable } from '@nestjs/common';
import { EmailAdapter } from './email-adapter';

@Injectable()
export class EmailManager {
    constructor(private emailAdapter: EmailAdapter) {}
    async sendConfirmationCode(email: string, code: string): Promise<boolean> {
        const message = ` <h1>Thanks for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href=\'https://somesite.com/confirm-email?code=${code}\'>complete registration</a>
            </p>
            Код: ${code}`;
        return this.emailAdapter.sendEmail(email, 'confirmarion', message);
    }
    async sendNewConformationCode(email: string, code: string): Promise<boolean> {
        const message =
            ' <h1>New confirmarion code</h1>\n' +
            ' <p>To finish registration please follow the link below:\n' +
            `     <a href=\'https://somesite.com/confirm-email?code=${code}\'>complete registration</a>\n` +
            ' </p>\n' +
            `Код: ${code}`;
        return this.emailAdapter.sendEmail(email, 'confirmarion', message);
    }
    async sendPasswordRecoveryMessage(email: string, code: string): Promise<boolean> {
        const message = `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;
        return this.emailAdapter.sendEmail(email, 'password recovery', message);
    }
}
