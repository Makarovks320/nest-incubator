import { IsNotEmpty, IsString } from 'class-validator';
import { IsConfirmationCodeValid } from './custom-validators/IsConfirmationCodeValid';

export class ConfirmationCode {
    @IsNotEmpty()
    @IsString()
    @IsConfirmationCodeValid()
    code: string;
}
