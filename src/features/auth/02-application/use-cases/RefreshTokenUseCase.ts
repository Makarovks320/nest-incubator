import { AuthTokenPair, JwtService, RefreshTokenInfoType } from '../../../../application/adapters/jwt/jwt-service';
import { AuthSession } from '../../03-domain/session-model';
import { SessionsQueryRepository } from '../../04-repositories/sessions-query-repository';
import { SessionService } from '../session-service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class RefreshTokenCommand {
    constructor(
        public userId: string,
        public ip: string,
        public currentRefreshToken: string,
    ) {}
}
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
    constructor(
        private jwtService: JwtService,
        private sessionService: SessionService,
        private sessionsQueryRepository: SessionsQueryRepository,
    ) {}

    async execute(command: RefreshTokenCommand): Promise<AuthTokenPair | null> {
        // из старого токена вытащим deviceId:
        const currentRTInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(
            command.currentRefreshToken,
        );
        const deviceId: string = currentRTInfo!.deviceId;

        // теперь создадим новую пару токенов:
        const accessToken: string = await this.jwtService.createAccessToken(command.userId);
        const newRefreshToken = await this.jwtService.createRefreshToken(command.userId, deviceId);

        // Получим информацию о текущей сессии:
        const currentSession: AuthSession | null = await this.sessionsQueryRepository.getAuthSessionForDevice(deviceId);
        if (!currentSession) {
            return null;
        }

        const session = await this.sessionService.updateSession(command.ip, deviceId, newRefreshToken, currentSession);
        if (!session) return null;

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
}
