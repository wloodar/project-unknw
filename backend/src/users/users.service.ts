import { Model } from 'mongoose';
import { Injectable, forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
    ) {}
    
    async createUser(userSignup: CreateUserDto): Promise<Object> {
        const findUser = await this.findOne(userSignup.email);

        if (findUser) {
            throw new UnauthorizedException("User with this email address already exists.");
        }

        const hashedPassword = await this.authService.passwordHash(userSignup.password);
        
        const user = await this.userModel.create({
            firstName: userSignup.firstName,
            lastName: userSignup.lastName,
            email: userSignup.email,
            password: hashedPassword
        })

        if (user) {
            // @ts-ignore mongoose doc
            const { password, ...responseUser } = user._doc;
            return responseUser;
        }

        return user;
    }

    async findOne(email: string): Promise<User | undefined> {
        return this.userModel.findOne({ email: email });
    }

}
