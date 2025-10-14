import { Controller, Patch } from '@nestjs/common';
import { UserId } from 'src/common/decorators';
import { UserService } from 'src/user/application/services/user.service';
import { UpdateUserDto } from 'src/user/dtos/update.user.dto';

@Controller('user')
export class UserController {
    constructor (private userService: UserService) {}
    @Patch('')
    update(@UserId() userId: string, data: UpdateUserDto){
        return this.userService.update(userId, data);
    }
}
