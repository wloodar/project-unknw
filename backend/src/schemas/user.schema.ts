import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User {
    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ unique: true })
    email: string;

    @Prop({ select: false })
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);