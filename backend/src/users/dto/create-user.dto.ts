import { IsNotEmpty, IsEmail, IsString, MinLength , MaxLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MaxLength(32)
    @IsNotEmpty()
    readonly firstName: string;

    @IsString()
    @MaxLength(32)
    @IsNotEmpty()
    readonly lastName: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(32)
    @IsNotEmpty()
    readonly password: string;
}