import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailRegistered } from './custom-validators/EmailExistenceValidator';

export class EmailDto {
    @IsNotEmpty()
    @IsString()
    @IsEmailRegistered()
    email: string;
}
