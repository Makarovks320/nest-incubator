import { Response, Request } from 'express';
export class AuthHelper {
    private refreshTokenOptions: { httpOnly: true; secure: true };

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
        res.cookie('refreshToken', refreshToken, this.refreshTokenOptions);
    }
}
