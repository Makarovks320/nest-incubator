import env from 'dotenv';

env.config();

export const appConfig: AppConfig = {
    port: Number(process.env.PORT) || 3000,
    authLogin: process.env.AUTH_LOGIN || 'admin',
    authPassword: process.env.AUTH_PASSWORD || 'qwerty',
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'secret',
    mongoUrl: process.env.MONGO_LOCAL_URL || process.env.MONGO_CLOUD_URL || 'mongodb://0.0.0.0:27017',
    gmailAdapterUser: process.env.EMAIL_ADDRESS || '',
    gmailAdapterPass: process.env.EMAIL_APP_PASS || '',
    dbName: process.env.MONGO_DB_NAME || 'incubator-project',
};

type AppConfig = {
    port: number;
    authLogin: string;
    authPassword: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    mongoUrl: string;
    dbName: string;
    gmailAdapterUser: string;
    gmailAdapterPass: string;
};
