import bcrypt from 'bcrypt';
import { CryptedDataType } from '../../../features/users/03-domain/user-db-model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
    async getCryptedData(password: string): Promise<CryptedDataType> {
        const passwordSalt = await bcrypt.genSalt(8);
        const passwordHash = await bcrypt.hash(password, passwordSalt);
        return {
            passwordSalt,
            passwordHash,
        };
    }
}
