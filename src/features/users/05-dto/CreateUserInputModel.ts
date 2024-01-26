import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { LOGIN_MATCH, LOGIN_MAX, LOGIN_MIN, PASSWORD_MAX, PASSWORD_MIN } from './dto-variables';

export class CreateUserInputModel {
    @IsNotEmpty()
    @MinLength(LOGIN_MIN)
    @MaxLength(LOGIN_MAX)
    @Matches(LOGIN_MATCH)
    login: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(PASSWORD_MIN)
    @MaxLength(PASSWORD_MAX)
    password: string;
}
