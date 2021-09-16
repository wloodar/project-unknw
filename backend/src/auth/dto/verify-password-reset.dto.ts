import { IsNotEmpty } from 'class-validator';

export class VerifyPasswordResetDto {
    
    @IsNotEmpty()
    readonly token: string;
}