import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { RefreshTokenDocument } from '../schemas/refreshToken.schema';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('RefreshToken') private refreshTokenModel: Model<RefreshTokenDocument>,
        @InjectModel('User') private userModel: Model<UserDocument>,
        private usersService: UsersService,
        private jwtService: JwtService
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

        const accessToken = await this.userAccessToken(user);
        return {
            access_token: accessToken,
            refresh_token: refreshToken.token
        }
    }

    // TODO: Check if token exists
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
