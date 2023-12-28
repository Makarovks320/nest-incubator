import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { EmailConfirmationType, User, UserDocument } from '../03-domain/user-db-model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserViewModel } from '../types/user-view-model';
import { UsersDataMapper } from '../01-api/users-data-mapper';

@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    async save(user: User): Promise<UserViewModel> {
        const createdUser: UserDocument = new this.userModel(user);
        await createdUser.save();
        return UsersDataMapper.getUserViewModel(createdUser);
    }

    // async addPassRecoveryCode(_id: ObjectId, passwordRecoveryCode: string): Promise<boolean> {
    //     const result = this.userModel.updateOne(
    //         { _id: _id },
    //         {
    //             $set: {
    //                 'passwordRecovery.passwordRecoveryCode': passwordRecoveryCode,
    //                 'passwordRecoveryCode.active': true,
    //             },
    //         },
    //     );
    //     return result.modifiedCount === 1;
    // }

    async confirmUserById(_id: ObjectId): Promise<boolean> {
        const result = await this.userModel.updateOne({ _id }, { $set: { 'emailConfirmation.isConfirmed': true } });
        return result.modifiedCount === 1;
    }

    async findUserById(id: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ _id: id });
        return user ? user : null;
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({
            $or: [{ 'accountData.userName': loginOrEmail }, { 'accountData.email': loginOrEmail }],
        });
        return user ? user : null;
    }

    async findUserByConfirmationCodeOrEmail(codeOrEmail: string): Promise<User | null> {
        const user = await this.userModel.findOne({
            $or: [{ 'emailConfirmation.confirmationCode': codeOrEmail }, { 'accountData.email': codeOrEmail }],
        });
        return user;
    }

    async updateConfirmationCode(_id: ObjectId, emailConfirmation: EmailConfirmationType): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { _id: _id },
            {
                $set: {
                    'emailConfirmation.confirmationCode': emailConfirmation.confirmationCode,
                    'emailConfirmation.expirationDate': emailConfirmation.expirationDate,
                },
            },
        );
        return result.modifiedCount === 1;
    }

    async updatePassword(newPasswordHash: string, userId: ObjectId): Promise<boolean> {
        const result = await this.userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    'accountData.hash': newPasswordHash,
                    'passwordRecovery.active': false,
                },
            },
        );
        return result.modifiedCount === 1;
    }

    async deleteUserById(id: string): Promise<boolean> {
        const result = await this.userModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }

    async clear(): Promise<void> {
        await this.userModel.deleteMany({});
    }
}
