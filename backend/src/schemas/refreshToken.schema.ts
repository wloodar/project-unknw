import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ collection: 'refreshToken', toJSON: { virtuals: true, getters: true } })
export class RefreshToken {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
    user: MongooseSchema.Types.ObjectId

    @Prop()
    token: string

    @Prop()
    expires: Date

    @Prop({ default: new Date() })
    created: Date

    @Prop()
    createdByIp: string

    @Prop()
    revoked: Date

    @Prop()
    revokedByIp: string

    @Prop()
    replacedByToken: string

    isExpired: boolean
    
    isActive: boolean
}

const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
 
RefreshTokenSchema.virtual('isExpired').get(function (this: RefreshTokenDocument) {
    return new Date() >= this.expires
});
 
RefreshTokenSchema.virtual('isActive').get(function (this: RefreshTokenDocument) {
    return !this.revoked && !this.isExpired;
});

export { RefreshTokenSchema };