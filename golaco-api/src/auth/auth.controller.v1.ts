import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';

@Controller({ path: 'auth', version: '1' })
export class AuthControllerV1 {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post()
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
