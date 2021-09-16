import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { addHours } from 'date-fns';

export type ForgottenPasswordDocument = ForgottenPassword & Document;

@Schema({ collection: 'forgottenPasswords' })
export class ForgottenPassword {
    
    @Prop()
    email: string;

    @Prop()
    token: string;

    @Prop({ default: new Date() })
    createdAt: Date;
}

const ForgottenPasswordSchema = SchemaFactory.createForClass(ForgottenPassword);

ForgottenPasswordSchema.virtual('isExpired').get(function(this: ForgottenPasswordDocument) {
    return new Date() > addHours(this.createdAt, 1);
});

export { ForgottenPasswordSchema };