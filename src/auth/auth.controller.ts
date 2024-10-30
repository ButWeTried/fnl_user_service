import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local.guard';

@Controller('/')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-users')
  async getUsers() {
    return this.usersService.findAll();
  }
}
