import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { RefreshTokenDocument } from '../schemas/refreshToken.schema';
import { UserDocument } from '../schemas/user.schema';
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto';
import { ForgottenPasswordDocument } from '../schemas/forgottenPassword.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<UserDocument>,
        @InjectModel('RefreshToken') private refreshTokenModel: Model<RefreshTokenDocument>,
        @InjectModel('ForgottenPassword') private forgottenPaswordModel: Model<ForgottenPasswordDocument>,
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);          

        if (user && this.comparePassword(pass, user)) {
            const { password, ...result } = user;
            return result;
        }
        
        return null;
    }

    async register(user: any) {
        const result = await this.usersService.createUser(user);

        if (result !== null) {
            return result;
        }

        return null;
    }

    async passwordHash(pass: string): Promise<string> {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(pass, salt);
    }

    private async comparePassword(providedPassword: string, user) {   
        const isMatch = await bcrypt.compare(providedPassword, user.password);

        if (!isMatch) {
            throw new UnauthorizedException("Passwords not match");
        }

        return true;
    }

    async login(user: any) {

        // User login succeced, generate JWT token and refresh token
        const refreshToken = await this.generateRefreshToken(user._doc._id, "");

        // Save refresh token in database
        await refreshToken.save();

        // Generate user access token
        const accessToken = await this.userAccessToken(user);

        return {
            access_token: accessToken,
            refresh_token: refreshToken.token
        }
    }

    async updateRefreshToken(currentRefreshToken) {

        if (currentRefreshToken === undefined) {
            throw new UnauthorizedException("Unauthorized refresh token action");
        }
        
        // Retreive active refresh token and fetch from mongodb 
        const fetchedCurrentRefreshToken = await this.getRefreshToken(currentRefreshToken);

        // Get user from retreived refresh token data
        const { user } = fetchedCurrentRefreshToken;

        // Generate new refresh token for user
        const newRefreshToken = await this.generateRefreshToken(user, "");

        // Modify current refresh token data and update it in database
        fetchedCurrentRefreshToken.revoked = new Date();
        fetchedCurrentRefreshToken.revokedByIp = "";
        fetchedCurrentRefreshToken.replacedByToken = newRefreshToken.token;

        // Save modified old refresh token
        await fetchedCurrentRefreshToken.save();

        // Save new refresh token in db
        await newRefreshToken.save();

        // Generate new user access token for authorization
        const jwtToken = await this.userAccessToken(user);

        return {
            access_token: jwtToken,
            refresh_token: newRefreshToken.token
        }
    }

    async revokeToken(token) {
        
        if (token === undefined) {
            throw new UnauthorizedException("Unauthorized refresh token action");
        } 

        // Retreive refresh token from database
        const refreshToken = await this.getRefreshToken(token);

        // Change values of revoking token
        refreshToken.revoked = new Date();
        refreshToken.revokedByIp = "";

        // Save updated data of revoking token 
        await refreshToken.save();

        // Success of revoking token, return true and set cookie to null
        return true;
    }

    async forgotPassword(createForgotPasswordDto: CreateForgotPasswordDto) {
        // Check if user with provided email exists
        const user = await this.usersService.findOne(createForgotPasswordDto.email);

        // if user with provided email don't exist, show success message without saving and sending mail
        if (!user) {
            return "Wiadomość została wysłana";
        }
        
        // Generate token for password reseting
        const token = await randomBytes(64).toString('hex');

        // Update / Create Entry in database with new data of password reseting operation
        const forgottenPasswordModel = await this.forgottenPaswordModel.findOneAndUpdate(
            { email: user.email },
            {
                email: user.email,
                token: token,
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Throw internal server error when data isnt retreived from database
        if (!forgottenPasswordModel) {
            throw new InternalServerErrorException();
        }

        const mail = await this.mailService.sendForgottenPassword(user.email, "Password Reset", token);

        // TODO: custom error handler
        if (!mail) {
            throw new InternalServerErrorException(); 
        }

        return {
            message: "Check your inbox for password reset message."
        }
    }

    async resetPassword() {

    }

    // Methods - - - - - -  Methods - - - - - -  Methods - - - - - -  Methods - - - - - -  Methods - - - - - - 

    //* Retrieve refresh token from database
    async getRefreshToken(token) {        
        const refreshToken = await this.refreshTokenModel.findOne({ token }).populate({ path: 'user', model: this.userModel }).exec();

        if (!refreshToken || !refreshToken.isActive) {
            throw "Invalid token";
        }

        return refreshToken;
    }

    //* Generate JWT refresh token
    async generateRefreshToken(user, ipAddress) {
        return new this.refreshTokenModel({
            user: user._id,
            token: randomBytes(40).toString('hex'),
            expires: new Date(new Date().setMonth(new Date().getMonth()+8)),
            createdByIp: ipAddress
        });
    }

    //* Generate User Access Token - Authorization
    async userAccessToken(user: any) {
        return this.jwtService.sign({ email: user.email, sub: user._doc._id })
    }
}
