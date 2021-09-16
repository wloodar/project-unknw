import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class ResetPasswordDto {

    @IsNotEmpty()
    @IsString()
    readonly token: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}