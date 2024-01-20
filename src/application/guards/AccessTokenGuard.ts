import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../adapters/jwt/jwt-service';
import { AuthHelper } from '../helpers/auth-helper';
import { UserService } from '../../features/users/02-services/user-service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private authHelper: AuthHelper,
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.authHelper.getBearerAuthToken(request);
        const userId = await this.jwtService.getUserIdByToken(token);
        if (!userId) {
            throw new UnauthorizedException();
        }
        const user = await this.userService.findUserById(userId);
        if (user) {
            request.userId = userId;
            return true;
        } else {
            throw new UnauthorizedException();
        }
    }
}
