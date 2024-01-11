import nodemailer from 'nodemailer';

export class EmailAdapter {
    async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_APP_PASS,
            },
        });
        // const info =
        await transport.sendMail({
            from: `INCUBATOR APP 👻 <${process.env.EMAIL_ADDRESS}>`,
            to: email,
            subject: subject,
            html: message,
        });
        // console.log(info);
        return true; // todo: посмотреть info, если там ошибка, то возвращать false
        //todo: return result.accepted.includes(config.to);
        // } catch (e: any) {
        //     console.log(`sendGEmail: ${e}`);
        //     return false;
        // }
    }
}
