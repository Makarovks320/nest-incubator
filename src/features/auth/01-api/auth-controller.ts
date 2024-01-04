import { Request, Response } from 'express';
import {v4 as uuidv4} from "uuid";
import { AuthLoginInputDto } from '../05-dto/AuthLoginInputDto';
import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../02-services/auth-service';
import { UserService } from '../../users/02-services/user-service';
import { SessionService } from '../02-services/session-service';
import { JwtService, RefreshTokenInfoType } from '../../../application/adapters/jwt-service';
import { IpType } from '../03-domain/session-model';
import { HttpStatus } from '../../../application/types/types';
import { UserDocument } from '../../users/03-domain/user-db-model';
import { UserAuthMeViewModel } from '../../users/types/user-auth-me-view-model';
import { RefreshTokenGuard } from '../../../application/guards/refreshTokenGuard';

const refreshTokenOptions = {httpOnly: true, secure: true}

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private sessionService: SessionService,
        private jwtService: JwtService
    ){}

    @Post('login')
    async login(@Body() input: AuthLoginInputDto, @Req() req: Request, @Res() res: Response) {
        const user: UserDocument | null = await this.userService.checkCredentials(input.loginOrEmail, input.password);
        if (user) {
            // todo: если есть валидный рефреш-токен, сделать перезапись сессии вместо создания новой
            // подготавливаем данные для сохранения сессии:
            const deviceId: string = uuidv4();
            const ip: IpType = req.headers['x-forwarded-for'] /*|| req.socket.remoteAddress*/ || "IP undefined";
            const deviceName: string = req.headers['user-agent'] || "device name is undefined";

            // создаем токены
            const accessToken: string = await this.jwtService.createAccessToken(user._id);
            const refreshToken: string = await this.jwtService.createRefreshToken(user._id, deviceId);

            // сохраняем текущую сессию:
            await this.sessionService.addSession(ip, deviceId, deviceName, refreshToken);

            res.status(HttpStatus.OK_200)
                .cookie('refreshToken', refreshToken, refreshTokenOptions)
                .send({accessToken: accessToken});
        } else {
            res.sendStatus(HttpStatus.UNAUTHORIZED_401);
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async logoutUser(@Req() req: Request, @Res() res: Response) {
        //здесь надо убить текущую сессию, для этого
        // возьмем deviceId:
        const refreshToken: string = req.cookies.refreshToken;
        const refreshTokenInfo: RefreshTokenInfoType | null = this.jwtService.getRefreshTokenInfo(refreshToken);
        if (!refreshTokenInfo) {
            res.sendStatus(HttpStatus.UNAUTHORIZED_401);
            return;
        }
        const deviceId: string = refreshTokenInfo.deviceId;
        // теперь убьем текущую сессию
        const result = await this.sessionService.deleteSessionByDeviceId(deviceId);
        if (!result) {
            res.sendStatus(HttpStatus.SERVER_ERROR_500);
            return;
        }
        res.cookie('refreshToken', '', refreshTokenOptions).sendStatus(HttpStatus.NO_CONTENT_204);
    }

    // @Post('refresh-token')
    // @HttpCode(HttpStatus.OK_200)
    // async refreshToken(@Req() req: Request, @Res() res: Response) {
    //     // сначала из старого токена вытащим инфу о текущей сессии (понадобится deviceId):
    //     const currentRefreshToken: string = req.cookies.refreshToken;
    //     const currentRTInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(currentRefreshToken);
    //     const deviceId: string = currentRTInfo!.deviceId;
    //
    //     // теперь создадим новую пару токенов:
    //     const accessToken: string = await this.jwtService.createAccessToken(req.userId);
    //     const newRefreshToken = await this.jwtService.createRefreshToken(req.userId, deviceId);
    //
    //     // Также может поменяться ip:
    //     const currentIp: IpType = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "IP undefined";
    //
    //     // Получим информацию о текущей сессии:
    //     const currentSession: SessionDbModel | null = await this.sessionService.getSessionForDevice(deviceId);
    //     if (!currentSession) {
    //         res.sendStatus(HttpStatus.SERVER_ERROR_500);
    //         return;
    //     }
    //
    //     const result = await this.sessionService.updateSession(currentIp, deviceId, newRefreshToken, currentSession);
    //     if (!result) {
    //         res.sendStatus(HttpStatus.SERVER_ERROR_500);
    //         return;
    //     }
    //
    //     res.status(HttpStatus.OK_200)
    //         .cookie('refreshToken', newRefreshToken, refreshTokenOptions)
    //         .send({accessToken: accessToken});
    // }

    @Get('me')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK_200)
    async getCurrentUserInfo(req: Request, res: Response) {
        const user: UserDocument | null = await this.userService.findUserById(req.userId)
        if (!user) {
            res.sendStatus(HttpStatus.UNAUTHORIZED_401)
        } else {
            const userAuthMeOutput: UserAuthMeViewModel = {
                email: user.email,
                login: user.login,
                userId: user._id.toString()
            }
            res.status(HttpStatus.OK_200).send(userAuthMeOutput);
        }
    }

    async registerNewUser(req: Request, res: Response) {
        const user = await this.authService.createUser(req.body.login, req.body.email, req.body.password)
        if (user) {
            res.status(HttpStatus.NO_CONTENT_204).send();
        } else {
            res.status(HttpStatus.BAD_REQUEST_400).send();
        }
    }

    async confirmRegistration(req: Request, res: Response) {
        const result = await this.authService.confirmEmailByCodeOrEmail(req.body.code)
        if (result) {
            res.status(HttpStatus.NO_CONTENT_204).send();
        } else {
            res.status(HttpStatus.BAD_REQUEST_400).send();
        }
    }

    async resendConfirmationCode(req: Request, res: Response) {
        const result = await this.authService.sendEmailWithNewCode(req.body.email)
        if (result) {
            res.status(HttpStatus.NO_CONTENT_204).send();
        } else {
            res.status(HttpStatus.BAD_REQUEST_400).send();
        }
    }

    @Post('password-recovery')
    async recoverPassword(req: Request, res: Response) {
        const isPasswordRecovered: boolean = await this.authService.sendEmailWithRecoveryPasswordCode(req.body.email);
        if (isPasswordRecovered) {
            res.status(HttpStatus.NO_CONTENT_204).send();
        } else {
            res.status(HttpStatus.SERVER_ERROR_500).send();
        }
    }

    // async updatePassword(req: Request, res: Response) {
    //     const result = await this.authService.updatePassword(req.body.newPassword, req.userId)
    //     if (result) {
    //         res.status(HttpStatus.NO_CONTENT_204).send()
    //     } else {
    //         res.status(HttpStatus.SERVER_ERROR_500).send()
    //     }
    // }
}