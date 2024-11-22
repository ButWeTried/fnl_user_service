import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;
export class Auth {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;
}

const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ email: 1 }, { unique: true });
export { AuthSchema };
