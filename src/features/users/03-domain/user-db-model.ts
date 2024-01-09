import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument, Model } from 'mongoose';
import { WithId } from '../../../application/types/types';
import { CreateUserInputDto } from '../05-dto/CreateUserInputDto';

export type UserDocument = HydratedDocument<User>;
export type UserModel = Model<UserDocument> & typeof staticMethods;

export type UserMongoType = WithId<User>;

const staticMethods = {
    async createUser(userInputData: CreateUserInputDto): Promise<UserDocument> {
        const passwordSalt = await bcrypt.genSalt(8); // получить через аргументы из сервиса
        const passwordHash = await this.generateHash(userInputData.password, passwordSalt);

        const newUser: UserDocument = new this(
            userInputData.login,
            userInputData.email,
            {
                salt: passwordSalt,
                hash: passwordHash,
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
    },
};

@Schema({ timestamps: true, statics: staticMethods })
export class User {
    constructor(
        login: string,
        email: string,
        accountData: AccountDataType,
        emailConfirmation: EmailConfirmationType,
        passwordRecovery: PasswordRecoveryType,
    ) {
        this.login = login;
        this.email = email;
        this.accountData = accountData;
        this.emailConfirmation = emailConfirmation;
        this.passwordRecovery = passwordRecovery;
    }

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

    generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
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

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
    // updatePost: User.prototype.checkCredentials,
    generateHash: User.prototype.generateHash,
};
