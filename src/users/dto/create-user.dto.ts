import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  username: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  birthday: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  role: string;
}
