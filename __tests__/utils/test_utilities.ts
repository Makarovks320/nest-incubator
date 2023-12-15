import dotenv from "dotenv";
import {runMongooseClient, stopMongooseClient} from "../../src/db/db";
import request from "supertest";
import {app} from "../../src/app_settings";
import {RouterPaths} from "../../src/helpers/router-paths";

dotenv.config();

const mongoUri: string = process.env.MONGO_CLOUD_URL || '';
if (!mongoUri) throw new Error('db uri is not passed');

export const authBasicHeader = {Authorization: 'Basic YWRtaW46cXdlcnR5'};

export function generateString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

export async function connectToDataBases () {
    await Promise.all([
        runMongooseClient()
    ]);
}
export async function clearDatabase () {
    await request(app).delete(RouterPaths.testing).set(authBasicHeader);
}

export async function disconnectFromDataBases () {
    await Promise.all([
        stopMongooseClient()
    ])
}
