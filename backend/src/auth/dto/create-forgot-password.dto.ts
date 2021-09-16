import {IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class CreateForgotPasswordDto {
    
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string
}