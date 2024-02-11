import { ConfirmEmailByCodeOrEmailUseCase } from './ConfirmEmailByCodeOrEmailUseCase';
import { CreateUserUseCase } from './CreateUserUseCase';
import { DeleteAllSessionsExcludeCurrentUseCase } from './DeleteAllSessionsExcludeCurrentUseCase';
import { DeleteSessionByDeviceIdUseCase } from './DeleteSessionByDeviceIdUseCase';
import { LoginUserUseCase } from './LoginUserUseCase';
import { RefreshTokenUseCase } from './RefreshTokenUseCase';
import { SendEmailWithNewCodeUseCase } from './SendEmailWithNewCodeUseCase';
import { SendEmailWithRecoveryPasswordCodeUseCase } from './SendEmailWithRecoveryPasswordCodeUseCase';
import { UpdatePasswordUseCase } from './UpdatePasswordUseCase';

export const authUseCases = [
    ConfirmEmailByCodeOrEmailUseCase,
    CreateUserUseCase,
    DeleteAllSessionsExcludeCurrentUseCase,
    DeleteSessionByDeviceIdUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    SendEmailWithNewCodeUseCase,
    SendEmailWithRecoveryPasswordCodeUseCase,
    UpdatePasswordUseCase,
];
