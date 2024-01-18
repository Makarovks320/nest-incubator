import { IsNotEmpty, IsString } from 'class-validator';
import { IsConfirmationCodeValid } from '../../../application/decorators/validation/IsConfirmationCodeValid';

export class ConfirmationCode {
    @IsNotEmpty()
    @IsString()
    @IsConfirmationCodeValid()
    code: string;
}
