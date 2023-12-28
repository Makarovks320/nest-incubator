import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginInputDto {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
