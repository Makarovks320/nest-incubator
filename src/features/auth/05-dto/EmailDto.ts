import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailRegistered } from '../../../application/decorators/validation/EmailExistenceValidator';

export class EmailDto {
    @IsNotEmpty()
    @IsString()
    @IsEmailRegistered()
    email: string;
}
