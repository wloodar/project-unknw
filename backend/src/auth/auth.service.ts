import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);          

        if (user && this.comparePassword(pass, user.password)) {
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
        const payload = { email: user.email, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
