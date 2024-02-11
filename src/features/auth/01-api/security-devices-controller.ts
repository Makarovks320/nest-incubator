import {
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    InternalServerErrorException,
    NotFoundException,
    Param,
    UseGuards,
} from '@nestjs/common';
import { RefreshTokenGuard } from '../../../application/guards/RefreshTokenGuard';
import { HttpStatus } from '../../../application/types/types';
import { GetUserId } from '../../../application/decorators/input-params/GetUserId';
import { GetAuthSessionInfo } from '../../../application/decorators/input-params/GetAuthSessionInfo';
import { AuthSessionInfoType } from '../05-dto/AuthSessionInfoType';
import { AuthDataMapper } from './AuthDataMapper';
import { SessionsRepository } from '../04-repositories/sessions-repository';
import { SessionsQueryRepository } from '../04-repositories/sessions-query-repository';
import { SessionService } from '../02-application/session-service';

@Controller('security/devices')
export class AuthSecurityController {
    constructor(
        private sessionsRepository: SessionsRepository,
        private sessionsQueryRepository: SessionsQueryRepository,
        private sessionService: SessionService,
    ) {}

    @Get()
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK_200)
    async getAll(@GetUserId() userId: string) {
        // передадим маппер в query-repo
        return await this.sessionsQueryRepository.getAllSessionsForUser(
            userId,
            AuthDataMapper.getSessionsListViewModel,
        );
    }

    @Delete()
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteAll(@GetAuthSessionInfo() sessionInfo: AuthSessionInfoType) {
        const isDeleted: boolean = await this.sessionService.deleteAllSessionsExcludeCurrent(
            sessionInfo.userId,
            sessionInfo.deviceId,
        );

        if (!isDeleted) {
            throw new InternalServerErrorException('session is not deleted');
        }
    }

    @Delete('/:id')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteDevice(@GetAuthSessionInfo() sessionInfo: AuthSessionInfoType, @Param('id') sessionId: string) {
        const session: AuthSessionInfoType | null = await this.sessionsQueryRepository.getSessionForDevice(
            sessionId,
            AuthDataMapper.getSessionUserIdAndDeviceId,
        );

        if (session === null) {
            throw new NotFoundException();
        }
        if (session.userId !== sessionInfo.userId) {
            throw new ForbiddenException();
        }

        const isDeleted: boolean = await this.sessionsRepository.deleteSessionByDeviceId(session.deviceId);

        if (!isDeleted) {
            throw new InternalServerErrorException('session not deleted');
        }
    }
}
