import { IsConfirmationCodeValid } from '../../../application/decorators/validation/IsConfirmationCodeValid';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';

export class ConfirmationCode {
    @IsNotEmptyString()
    @IsConfirmationCodeValid()
    code: string;
}
