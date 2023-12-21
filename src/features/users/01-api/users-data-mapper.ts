import { UserDocument } from '../03-domain/user-db-model';
import { UserViewModel } from '../types/user-view-model';

export class UsersDataMapper {
    constructor() {}

    static getUserViewModel(user: UserDocument): UserViewModel {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
        };
    }
}
