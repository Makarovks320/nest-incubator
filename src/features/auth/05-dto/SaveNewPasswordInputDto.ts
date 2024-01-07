import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX, PASSWORD_MIN } from '../../users/05-dto/dto-variables';
import { IsPassConfirmationCodeValid } from './custom-validators/IsPassConfirmationCodeValid';

export class SaveNewPasswordInputDto {
    @IsNotEmpty()
    @IsPassConfirmationCodeValid()
    recoveryCode: string;

    @IsNotEmpty()
    @MinLength(PASSWORD_MIN)
    @MaxLength(PASSWORD_MAX)
    newPassword: string;
}
