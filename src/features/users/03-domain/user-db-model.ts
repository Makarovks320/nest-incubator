import { CreateUserInputModel } from '../types/create-input-user-model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { WithId } from '../../../common/types';

export type UserDocument = HydratedDocument<User>;
export type UserMongoType = WithId<User>;

@Schema()
export class User {
    constructor(
        accountData: AccountDataType,
        emailConfirmation: EmailConfirmationType,
        passwordRecovery: PasswordRecoveryType,
    ) {
        this.accountData = accountData;
        this.emailConfirmation = emailConfirmation;
        this.passwordRecovery = passwordRecovery;
    }

    @Prop({
        type: {
            userName: { type: String, required: true },
            email: { type: String, required: true },
            salt: { type: String, required: true },
            hash: { type: String, required: true },
            createdAt: { type: String, required: true },
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

    static async createUser(userInputData: CreateUserInputModel): Promise<User> {
        const passwordSalt = await bcrypt.genSalt(8);
        const passwordHash = await this.prototype.generateHash(userInputData.password, passwordSalt);
        const newUser: User = new this(
            {
                userName: userInputData.login,
                email: userInputData.email,
                salt: passwordSalt,
                hash: passwordHash,
                createdAt: new Date().toISOString(),
            },
            {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    minutes: 15,
                }),
                isConfirmed: false,
            },
            {
                passwordRecoveryCode: '',
                active: false,
            },
        );
        return newUser;
    }

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

    generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
}

type AccountDataType = {
    userName: string;
    email: string;
    salt: string;
    hash: string;
    createdAt: string;
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

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
    // updatePost: User.prototype.checkCredentials,
    generateHash: User.prototype.generateHash,
};

UserSchema.statics = {
    createPost: User.createUser,
};
