import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmationCode {
    @IsNotEmpty()
    @IsString()
    code: string;
}
