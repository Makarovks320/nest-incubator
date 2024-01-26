import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument, Model } from 'mongoose';
import { WithId } from '../../../application/types/types';
import { CreateUserInputModel } from '../05-dto/CreateUserInputModel';

export type UserDocument = HydratedDocument<User>;
export type UserModel = Model<UserDocument> & typeof staticMethods;

export type UserMongoType = WithId<User>;

const staticMethods = {
    async createUser(userInputData: CreateUserInputModel, cryptedData: CryptedDataType): Promise<UserDocument> {
        const newUser: UserDocument = new this({
            login: userInputData.login,
            email: userInputData.email,
            accountData: {
                salt: cryptedData.passwordSalt,
                hash: cryptedData.passwordHash,
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    minutes: 15,
                }),
                isConfirmed: false,
            },
            passwordRecovery: {
                passwordRecoveryCode: '',
                active: false,
            },
        });
        return newUser;
    },
};

@Schema({ timestamps: true, statics: staticMethods })
export class User {
    @Prop({ required: true })
    login: string;
    @Prop({ required: true })
    email: string;
    @Prop({
        type: {
            salt: { type: String, required: true },
            hash: { type: String, required: true },
        },
    })
    accountData: AccountDataType;

    @Prop({
        type: {
            confirmationCode: { type: String, required: true },
            isConfirmed: { type: Boolean, required: true },
            expirationDate: { type: Date, required: true },
        },
    })
    emailConfirmation: EmailConfirmationType;

    @Prop({
        type: {
            passwordRecoveryCode: { type: String, required: false },
            active: { type: Boolean, required: true },
        },
    })
    passwordRecovery: PasswordRecoveryType;

    createdAt: Date;

    // async checkCredentials(loginOrEmail: string, password: string): Promise<User | null> {
    //     const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
    //     if (!user) return null;
    //     const passwordHash = await this._generateHash(password, user.accountData.salt);
    //     if (user.accountData.hash !== passwordHash) {
    //         return null;
    //     } else {
    //         return user;
    //     }
    // }
}

type AccountDataType = {
    salt: string;
    hash: string;
};
export type EmailConfirmationType = {
    confirmationCode: string;
    isConfirmed: boolean;
    expirationDate: Date;
};
export type PasswordRecoveryType = {
    passwordRecoveryCode: string;
    active: boolean;
};
export type CryptedDataType = {
    passwordSalt: string;
    passwordHash: string;
};

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
    // updatePost: User.prototype.checkCredentials,
};
