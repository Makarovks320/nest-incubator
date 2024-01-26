import { Response, Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
export class AuthHelper {
    private refreshTokenOptions = { httpOnly: true, secure: true };
    private refreshTokenName = 'refreshToken';

    getIp(req: Request): string | undefined {
        return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    }

    getRefreshToken(req: Request): string {
        return req.cookies.refreshToken;
    }
    getUserAgent(req: Request): string | null {
        return req.headers['user-agent'] || null;
    }
    addRefreshTokenToCookie(res: Response, refreshToken: string): void {
        res.cookie(this.refreshTokenName, refreshToken, this.refreshTokenOptions);
    }

    clearRefreshToken(res: Response): void {
        res.clearCookie(this.refreshTokenName);
    }

    getBearerAuthToken(request: Request) {
        const { authorization } = request.headers;
        if (!authorization) {
            throw new UnauthorizedException();
        }
        const token = authorization.split(' ')[1];
        return token;
    }
}
