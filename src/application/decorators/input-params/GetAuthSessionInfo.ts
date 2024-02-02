import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthSessionInfoType } from '../../../features/auth/05-dto/AuthSessionInfoType';

export const GetAuthSessionInfo = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthSessionInfoType => {
    const request = ctx.switchToHttp().getRequest();
    if (request.userId === null || request.deviceId === null) {
        throw new Error('Userid or deviceId is not provided');
    }
    return {
        userId: request.userId,
        deviceId: request.deviceId,
    };
});
