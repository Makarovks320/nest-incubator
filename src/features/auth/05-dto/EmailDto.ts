import { IsEmailRegistered } from '../../../application/decorators/validation/EmailExistenceValidator';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';

export class EmailDto {
    @IsNotEmptyString()
    @IsEmailRegistered()
    email: string;
}
