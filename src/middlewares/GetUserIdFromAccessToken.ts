import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../application/adapters/jwt/jwt-service';
import { UsersRepository } from '../features/users/04-repositories/users-repository';

@Injectable()
export class GetUserIdFromAccessToken implements NestMiddleware {
    constructor(
        private jwtService: JwtService,
        private usersRepository: UsersRepository,
    ) {}
    async use(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            next();
            return;
        }
        const token = req.headers.authorization.split(' ')[1];
        const userId: string | null = await this.jwtService.getUserIdByToken(token);
        if (!userId) {
            next();
            return;
        }
        const user = await this.usersRepository.findUserById(userId);
        if (user) {
            req.userId = userId;
            next();
        }
    }
}
