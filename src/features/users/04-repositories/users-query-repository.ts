import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserMongoType } from '../03-domain/user-db-model';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { SortDirection, UsersQueryParams } from '../types/users-query-params';
import { WithPagination } from '../../../application/types/types';
import { UserViewModel } from '../types/user-view-model';
import { UsersDataMapper } from '../01-api/users-data-mapper';

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async getUsers(queryParams: UsersQueryParams): Promise<WithPagination<UserViewModel>> {
        let filter: FilterQuery<UserMongoType> = {};
        if (queryParams.searchEmailTerm || queryParams.searchLoginTerm) {
            filter = {
                $or: [],
            };
        }
        if (queryParams.searchEmailTerm) {
            filter.$or!.push({ email: { $regex: queryParams.searchEmailTerm, $options: 'i' } });
        }
        if (queryParams.searchLoginTerm) {
            filter.$or!.push({ login: { $regex: queryParams.searchLoginTerm, $options: 'i' } });
        }

        const sort: Record<string, SortDirection> = {};
        if (queryParams.sortBy) {
            sort[queryParams.sortBy] = queryParams.sortDirection;
        }
        const users: UserDocument[] = await this.userModel
            .find(filter)
            .sort(sort)
            .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
            .limit(queryParams.pageSize)
            .lean();

        const totalCount = await this.userModel.countDocuments(filter);

        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount: totalCount,
            items: users.map(user => UsersDataMapper.getUserViewModel(user)),
        };
    }

    async findUserByPassRecoveryCode(code: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ 'passwordRecovery.passwordRecoveryCode': code });
    }

    async getUserById(userId: string): Promise<UserViewModel | null> {
        const user = await this.userModel.findById(userId).lean();
        if (user) {
            return UsersDataMapper.getUserViewModel(user);
        }
        return null;
    }
}
