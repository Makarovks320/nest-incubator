import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersQueryRepository } from '../features/users/04-repositories/users-query-repository';
import { UserDocument } from '../features/users/03-domain/user-db-model';

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
    constructor(private usersQueryRepo: UsersQueryRepository) {}
    async use(req: Request, res: Response, next: NextFunction) {
        const code = req.body.recoveryCode;
        const user: UserDocument | null = await this.usersQueryRepo.findUserByPassRecoveryCode(code);
        if (user) {
            req.userId = user.id || null;
        }
        next();
    }
}
