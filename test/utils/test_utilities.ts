import dotenv from 'dotenv';

dotenv.config();

export const authBasicHeader = { Authorization: 'Basic YWRtaW46cXdlcnR5' };

export function generateString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

//функция задержки времени
export function delay(milliseconds: number): Promise<any> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(1);
        }, milliseconds);
    });
}
