import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ collection: 'refreshToken' })
export class RefreshToken {
    @Prop({ type: Types.ObjectId, ref: 'users' })
    user: Types.ObjectId

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
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.virtual('isExpired').get(function() {
    return new Date() >= this.expires;
});

RefreshTokenSchema.virtual('isActive').get(function () {
    return !this.revoked && !this.isExpired;
});