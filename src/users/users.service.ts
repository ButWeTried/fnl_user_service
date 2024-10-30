import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const user = new this.userModel(createUserDto);
      await user.save();
      return this.userModel.findOne({ _id: user._id });
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const user = new this.userModel(createUserDto);
      await user.save();
      return this.userModel.findOne({ _id: user._id });
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find();
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.userModel.deleteOne({ id: id });
  }

  async getUser(query: object): Promise<User> {
    return this.userModel.findOne(query).select('+password');
  }

  async checkPassword({
    id,
    password,
  }: {
    id: string;
    password: string;
  }): Promise<User> {
    if (
      !Types.ObjectId.isValid(id) ||
      new Types.ObjectId(id).toString() !== id
    ) {
      throw new NotFoundException('Invalid ID format');
    }
    const user = await this.userModel.findOne({ _id: id }).select('+password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Password does not match');
    }

    user.password = undefined;
    return user;
  }

  async changePassword(
    id: string,
    updatePasswordDto: { password: string },
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, updatePasswordDto, {
      new: true,
    });
  }
}
