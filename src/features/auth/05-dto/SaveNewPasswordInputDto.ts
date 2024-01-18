import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX, PASSWORD_MIN } from '../../users/05-dto/dto-variables';
import { IsRecoveryCodeValid } from '../../../application/decorators/validation/IsRecoveryCodeValid';

export class SaveNewPasswordInputDto {
    @IsNotEmpty()
    @IsRecoveryCodeValid()
    recoveryCode: string;

    @IsNotEmpty()
    @MinLength(PASSWORD_MIN)
    @MaxLength(PASSWORD_MAX)
    newPassword: string;
}
