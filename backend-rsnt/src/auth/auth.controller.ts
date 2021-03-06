import { Controller, Body, ValidationPipe, Get, UseGuards, Req, Res, Logger, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update.dto';
import * as _ from 'lodash';

@Controller('/v1/auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  @Get('/spotify')
  @UseGuards(AuthGuard('spotify'))
  authenticateSpotify(): Promise<void> {
    // start the authentication flow
    return;
  }

  @Get('/spotify/callback')
  @UseGuards(AuthGuard('spotify'))
  spotifyCallBack(@Req() req: Request, @Res() res: Response, @GetUser() user: User): Promise<void> {
    this.logger.verbose('GET on /spotify/callback called');
    return this.authService.sendCredentials(req, res, user);
  }

  @Get('/signout')
  signOutUser(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.verbose('GET on /signout called');
    return this.authService.signOutUser(req, res);
  }

  @Get('/user/refresh')
  refreshCredentials(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.verbose('GET on /user/refresh called');
    return this.authService.refreshCredentials(req, res);
  }

  @Put('/user/update')
  @UseGuards(AuthGuard())
  async updateUserDetails(
    @Body(ValidationPipe) updateDetailsDto: UpdateUserDto,
    @GetUser() user: User
  ): Promise<_.Omit<User, 'refreshToken' | 'email' | 'tokenVer'>> {
    this.logger.verbose('GET on /user/total/detail called');
    const fetchedUser = await this.authService.updateUserDetails(updateDetailsDto, user);
    return _.omit(fetchedUser, ['refreshToken', 'email', 'tokenVer']);
  }

  @Get('/public/user/:userId')
  getBasicUserById(@Param('userId') userId: string): Promise<{ id: string; displayName: string }> {
    this.logger.verbose(`GET on /public/user/${userId} called`);
    return this.authService.getBasicUserById(userId);
  }

  @Get('/private/user/')
  @UseGuards(AuthGuard())
  async getPrivateUserById(@GetUser() user: User): Promise<_.Omit<User, 'refreshToken' | 'email' | 'tokenVer'>> {
    this.logger.verbose(`GET on /private/user called`);
    const fetchedUser = await this.authService.getUserById(user.id);
    return _.omit(fetchedUser, ['refreshToken', 'email', 'tokenVer']);
  }
}
