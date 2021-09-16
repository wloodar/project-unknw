import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { addHours } from 'date-fns';

export type ForgotPasswordDocument = ForgotPassword & Document;

@Schema()
export class ForgotPassword {
    
    @Prop()
    email: string;

    @Prop()
    token: string;

    @Prop({ default: new Date() })
    createdAt: Date;
}

const ForgotPasswordSchema = SchemaFactory.createForClass(ForgotPassword);

ForgotPasswordSchema.virtual('isExpired').get(function(this: ForgotPasswordDocument) {
    return new Date() > addHours(this.createdAt, 1);
});

export { ForgotPasswordSchema };