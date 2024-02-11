import { Injectable } from '@nestjs/common';
import { AuthLoginInputDto } from '../../05-dto/AuthLoginInputDto';
import { AuthTokenPair, JwtService } from '../../../../application/adapters/jwt/jwt-service';
import { UserDocument } from '../../../users/03-domain/user-db-model';
import { UserService } from '../../../users/02-services/user-service';
import { SessionService } from '../session-service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoginUserUseCase {
    constructor(
        private userService: UserService,
        private sessionService: SessionService,
        private jwtService: JwtService,
    ) {}

    async execute(input: AuthLoginInputDto, ip: string, deviceName: string | null): Promise<AuthTokenPair | null> {
        const user: UserDocument | null = await this.userService.checkCredentials(input.loginOrEmail, input.password);
        if (!user) return null;

        // todo: если есть валидный рефреш-токен, сделать перезапись сессии вместо создания новой
        // подготавливаем данные для сохранения сессии:
        const deviceId: string = uuidv4();

        // создаем токены
        const accessToken: string = await this.jwtService.createAccessToken(user._id.toString());
        const refreshToken: string = await this.jwtService.createRefreshToken(user._id.toString(), deviceId);

        // сохраняем текущую сессию:
        await this.sessionService.addSession(ip, deviceId, deviceName, refreshToken);

        return {
            accessToken,
            refreshToken,
        };
    }
}
