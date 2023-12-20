import { User, UserDocument } from '../03-domain/user-db-model';
import { UserViewModel } from '../types/user-view-model';

export class UsersDataMapper {
    constructor() {}

    static getUserViewModel(user: UserDocument): UserViewModel {
        return {
            id: user._id.toString(),
            login: user.accountData.userName,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt,
        };
    }
}
