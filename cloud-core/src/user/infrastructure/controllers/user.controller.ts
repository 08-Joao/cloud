
import { Controller, Get, Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserService } from 'src/user/application/services/user.service';
import { CurrentUser } from 'src/auth/infrastructure/decorators/current-user.decorator';
import { GetGlobalUserDto } from 'src/auth/dtos/get-global-user.dto';
import { AuthGuard } from 'src/auth/infrastructure/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async getMe(@CurrentUser() user: GetGlobalUserDto) {
    Logger.log("Aqui");
    Logger.log(user);
    return user;
  }

  @Get('storage')
  async getStorage(@CurrentUser() user: GetGlobalUserDto) {
    const localUser = await this.userService.findById(user.id);

    if (!localUser) {
      throw new NotFoundException('User not found');
    }

    return {
      used: localUser.storageUsed,
      quota: localUser.storageQuota,
    }
  }
}
