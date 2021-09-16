import { Controller, Request, Post, UseGuards, Get, UsePipes, ValidationPipe, Body, Res, Req } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { response } from 'express';
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto';
import { VerifyPasswordResetDto } from './dto/verify-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    async register(@Body(ValidationPipe) userSignup: CreateUserDto) {
        return this.authService.register(userSignup);
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) res) {
        const { access_token, refresh_token } =  await this.authService.login(req.user);
        
        this.setTokenCookie(res, refresh_token);

        return {
            access_token: access_token
        }
    } 
    
    @Public()
    @Post('refresh-token')
    async refreshToken(@Request() req, @Res({ passthrough: true }) res) {
        const { access_token, refresh_token } = await this.authService.updateRefreshToken(req.cookies.refreshtoken);

        this.setTokenCookie(res, refresh_token);
        
        return {
            access_token: access_token
        }
    }

    @Public()
    @Post('revoke-token')
    async revokeToken(@Request() req, @Res({ passthrough: true }) res) {
        const revoked = await this.authService.revokeToken(req.cookies.refreshtoken);

        if (revoked) {
            res.cookie('refreshtoken', {
                maxAge: 0,
                overwrite: true, 
            })
        }

        return {
            message: "Token revoked"
        }
    }

    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body(ValidationPipe) createForgotPassword: CreateForgotPasswordDto) {
        return this.authService.forgotPassword(createForgotPassword);
    }

    @Public()
    @Post('forgot-password-verify')
    async forgotPasswordVerify(@Body() verifyPasswordResetDto: VerifyPasswordResetDto) {
        return this.authService.forgotPasswordVerify(verifyPasswordResetDto);
    }

    @Public()
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    setTokenCookie(res, refreshToken) {
        res.cookie("refreshtoken", refreshToken, {
            expiresIn: "30d",
            httpOnly: true
        })
    }
}