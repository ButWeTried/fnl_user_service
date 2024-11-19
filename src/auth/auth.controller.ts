import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/enum/user-role.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdatePasswordDto } from 'src/users/dto/update-password.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from './../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local.guard';

@ApiTags('users')
@Controller('/')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  ////////// AUTHENTICATION //////////
  // @UseGuards(LocalAuthGuard)
  @Post('auth/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    createUserDto.password = hashedPassword;
    createUserDto.role = UserRole.User;
    return this.usersService.create(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/signin')
  async signin(@Request() req) {
    return this.authService.login(req.user);
  }

  ////////// PROFILE MANAGEMENT //////////
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      await this.usersService.checkPassword({
        id: req.user._id,
        password: updatePasswordDto.password,
      });

      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(
        updatePasswordDto.newPassword,
        saltOrRounds,
      );
      await this.usersService.changePassword(req.user._id, {
        password: hashedPassword,
      });

      return { message: 'Password successfully changed!' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  ////////// USER MANAGEMENT //////////
  @UseGuards(JwtAuthGuard)
  @Post('users/create')
  async createUser(@Request() req, @Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.findOne(req.user._id);
    if (user.role !== UserRole.Admin) {
      throw new Error('Unauthorized');
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    createUserDto.password = hashedPassword;
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  async updateUser(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.findOne(req.user._id);
    if (user.role !== UserRole.Admin) {
      throw new Error('Unauthorized');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    const user = await this.usersService.findOne(req.user._id);
    if (user.role !== UserRole.Admin) {
      throw new Error('Unauthorized');
    }
    return this.usersService.remove(id);
  }
}
