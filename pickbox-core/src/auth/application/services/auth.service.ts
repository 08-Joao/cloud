import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from 'src/auth/dtos/signin.dto';
import { SignUpDto } from 'src/auth/dtos/signup.dto';
import { UpdateAuthDto } from 'src/auth/dtos/update.dto';
import { AuthMapper } from 'src/auth/infrastructure/mappers/auth.mapper';
import { UserService } from 'src/user/application/services/user.service';
import { UserMapper } from 'src/user/infrastructure/mappers/user.mapper';
import { comparePassword } from 'src/utils/bcrypt.util';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  
  async me(userId: string) {
    return await this.userService.findById(userId);
  }
  async signin(data: SignInDto) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return { accessToken, user: UserMapper.toGetUserDto(user) };
  }

  async signup(data: SignUpDto) {
    if(data.password !== data.confirmPassword) {
      throw new ForbiddenException('Passwords do not match');
    }

    const userCreationData = AuthMapper.toCreateUserDto(data);

    const newUser = await this.userService.create(userCreationData);
    const accessToken = await this.jwtService.signAsync({
      id: newUser.id,
      email: newUser.email,
    });
    return { accessToken, user: UserMapper.toGetUserDto(newUser) }; 
  }

  async update(userId: string, data: UpdateAuthDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = comparePassword(data.oldPassword, user.password);
    if(!isPasswordValid) {
        throw new ForbiddenException('Invalid credentials');
    }

    if(data.password !== data.confirmPassword) {
      throw new ForbiddenException('Passwords do not match');
    }

    const updatedUser = await this.userService.update(userId, AuthMapper.toUpdateUserDto(data));
    const accessToken = await this.jwtService.signAsync({
      id: updatedUser.id,
      email: updatedUser.email,
    });
    return { accessToken, user: UserMapper.toGetUserDto(updatedUser) };
  }

}
