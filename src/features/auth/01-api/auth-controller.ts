import { Request, Response } from 'express';
import { AuthLoginInputDto } from '../05-dto/AuthLoginInputDto';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    InternalServerErrorException,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { SessionService } from '../02-application/session-service';
import { AuthTokenPair } from '../../../application/adapters/jwt/jwt-service';
import { HttpStatus } from '../../../application/types/types';
import { UserAuthMeViewModel } from '../../users/types/user-auth-me-view-model';
import { RefreshTokenGuard } from '../../../application/guards/RefreshTokenGuard';
import { CreateUserInputModel } from '../../users/05-dto/CreateUserInputModel';
import { UserViewModel } from '../../users/types/user-view-model';
import { LoginOrEmailExistenceGuard } from '../../../application/guards/Login-or-email-existence-guard.service';
import { SaveNewPasswordInputDto } from '../05-dto/SaveNewPasswordInputDto';
import { EmailDto } from '../05-dto/EmailDto';
import { ConfirmationCode } from '../05-dto/ConfirmationCode';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthHelper } from '../../../application/helpers/auth-helper';
import { UsersQueryRepository } from '../../users/04-repositories/users-query-repository';
import { AccessTokenGuard } from '../../../application/guards/AccessTokenGuard';
import { CommandBus } from '@nestjs/cqrs';
import { ConfirmEmailByCodeOrEmailCommand } from '../02-application/use-cases/ConfirmEmailByCodeOrEmailUseCase';
import { CreateUserCommand } from '../02-application/use-cases/CreateUserUseCase';
import { DeleteSessionByDeviceIdCommand } from '../02-application/use-cases/DeleteSessionByDeviceIdUseCase';
import { LoginUserCommand } from '../02-application/use-cases/LoginUserUseCase';
import { RefreshTokenCommand } from '../02-application/use-cases/RefreshTokenUseCase';
import { SendEmailWithNewCodeCommand } from '../02-application/use-cases/SendEmailWithNewCodeUseCase';
import { SendEmailWithRecoveryPasswordCodeCommand } from '../02-application/use-cases/SendEmailWithRecoveryPasswordCodeUseCase';
import { UpdatePasswordCommand } from '../02-application/use-cases/UpdatePasswordUseCase';

@Controller('auth')
export class AuthController {
    constructor(
        private authHelper: AuthHelper,
        private sessionService: SessionService,
        private usersQueryRepository: UsersQueryRepository,
        private commandBus: CommandBus,
    ) {}

    @Post('login')
    @UseGuards(ThrottlerGuard)
    async login(@Body() input: AuthLoginInputDto, @Req() req: Request, @Res() res: Response) {
        const ip = this.authHelper.getIp(req);
        if (!ip) throw new BadRequestException('ip is not defined');

        const deviceName = this.authHelper.getUserAgent(req);

        const authTokenPair: AuthTokenPair | null = await this.commandBus.execute(
            new LoginUserCommand(input, ip, deviceName),
        );
        if (!authTokenPair) {
            throw new UnauthorizedException();
        } else {
            this.authHelper.addRefreshTokenToCookie(res, authTokenPair.refreshToken);
            res.status(HttpStatus.OK_200).send({ accessToken: authTokenPair.accessToken });
        }
    }

    @Post('logout')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async logoutUser(@Req() req: Request, @Res() res: Response) {
        const result = await this.commandBus.execute(new DeleteSessionByDeviceIdCommand(req.deviceId));
        if (!result) {
            res.sendStatus(HttpStatus.SERVER_ERROR_500);
            return;
        }
        this.authHelper.clearRefreshToken(res);
        res.sendStatus(HttpStatus.NO_CONTENT_204);
    }

    @Post('refresh-token')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK_200)
    async refreshToken(@Req() req: Request, @Res() res: Response) {
        // возьмем старый токен для получения информации о текущей сессии
        const currentRefreshToken = this.authHelper.getRefreshToken(req);
        // Возьмем ip, поскольку у клиента он мог поменяться:
        const ip = this.authHelper.getIp(req);
        if (!ip) throw new BadRequestException('ip is not defined');

        const authTokenPair = await this.commandBus.execute(
            new RefreshTokenCommand(req.userId, ip, currentRefreshToken),
        );

        if (!authTokenPair) {
            throw new InternalServerErrorException();
        } else {
            this.authHelper.addRefreshTokenToCookie(res, authTokenPair.refreshToken);
            res.status(HttpStatus.OK_200).send({ accessToken: authTokenPair.accessToken });
        }
    }

    @Get('me')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK_200)
    async getCurrentUserInfo(@Req() req: Request, @Res() res: Response) {
        const user: UserViewModel | null = await this.usersQueryRepository.getUserById(req.userId);
        if (!user) {
            res.sendStatus(HttpStatus.UNAUTHORIZED_401);
        } else {
            const userAuthMeOutput: UserAuthMeViewModel = {
                email: user.email,
                login: user.login,
                userId: user.id,
            };
            res.status(HttpStatus.OK_200).send(userAuthMeOutput);
        }
    }

    @Post('registration')
    @UseGuards(ThrottlerGuard, LoginOrEmailExistenceGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async registerNewUser(@Body() inputModel: CreateUserInputModel) {
        const createdUser: UserViewModel | null = await this.commandBus.execute(new CreateUserCommand(inputModel));
        if (!createdUser) throw new BadRequestException();
        return;
    }

    @Post('registration-confirmation')
    @UseGuards(ThrottlerGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async confirmRegistration(@Body() confirmationData: ConfirmationCode) {
        const result = await this.commandBus.execute(new ConfirmEmailByCodeOrEmailCommand(confirmationData.code));
        if (!result) {
            throw new InternalServerErrorException();
        }
        return;
    }

    @Post('registration-email-resending')
    @UseGuards(ThrottlerGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async resendConfirmationCode(@Body() emailData: EmailDto) {
        const result = await this.commandBus.execute(new SendEmailWithNewCodeCommand(emailData.email));
        if (!result) {
            throw new BadRequestException();
        } else {
            return;
        }
    }

    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async recoverPassword(@Body() recoveryData: { email: string }) {
        const isPasswordRecovered: boolean = await this.commandBus.execute(
            new SendEmailWithRecoveryPasswordCodeCommand(recoveryData.email),
        );
        return isPasswordRecovered;
    }

    @Post('/new-password')
    @UseGuards(ThrottlerGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async updatePassword(@Body() inputPasswordDto: SaveNewPasswordInputDto, @Req() req: Request, @Res() res: Response) {
        if (!req.userId) throw new InternalServerErrorException('userId is undefined');
        const result = await this.commandBus.execute(
            new UpdatePasswordCommand(inputPasswordDto.newPassword, req.userId),
        );
        if (!result) {
            res.status(HttpStatus.BAD_REQUEST_400).send();
        }
        res.status(HttpStatus.NO_CONTENT_204).send();
    }
}
