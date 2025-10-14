import { Body, Controller, Get, Logger, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/application/services/auth.service';
import { SignInDto } from 'src/auth/dtos/signin.dto';
import { SignUpDto } from 'src/auth/dtos/signup.dto';
import { UserId } from 'src/common/decorators';
import type { Response } from 'express';
import { UpdateAuthDto } from 'src/auth/dtos/update.dto';
import { FolderRoleGuard } from '../guards/FolderRoleGuard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Get('/me')
    @UseGuards(FolderRoleGuard)
    async me(@UserId() userId: string) {
        return this.authService.me(userId);
    }

    @Post('/signup')
    async signup(@Body() data: SignUpDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, user } = await this.authService.signup(data);

        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions = isProd
            ? {
                httpOnly: true,
                sameSite: 'none' as const,
                secure: true,
                domain: '.tehkly.com',
                maxAge: parseInt(process.env.MAX_AGE as string) || 1000 * 60 * 60 * 24,
            }
            : {
                httpOnly: true,
                sameSite: 'lax' as const,
                maxAge: parseInt(process.env.MAX_AGE as string) || 1000 * 60 * 60 * 24,
            };

        res.cookie('accessToken', accessToken, cookieOptions);

        return user;
    } 

    @Post('/signin')
    async signin(@Body() data: SignInDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, user } = await this.authService.signin(data);
        
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions = isProd
            ? {
                httpOnly: true,
                sameSite: 'none' as const,
                secure: true,
                domain: '.tehkly.com',
                maxAge: parseInt(process.env.MAX_AGE as string) || 1000 * 60 * 60 * 24,
            }
            : {
                httpOnly: true,
                sameSite: 'lax' as const,
                maxAge: parseInt(process.env.MAX_AGE as string) || 1000 * 60 * 60 * 24,
            };

        res.cookie('accessToken', accessToken, cookieOptions);

        return user; 
    }

    @Post('/signout')
    async signout(@Res({ passthrough: true }) res: Response) {
        const isProd = process.env.NODE_ENV === 'production';
        const clearOptions = isProd
            ? { sameSite: 'none' as const, secure: true, domain: '.tehkly.com' }
            : { sameSite: 'lax' as const };
        res.clearCookie('accessToken', clearOptions);
        return { message: 'Signout successful' };
    }

    @Patch('/update')
    async update(@UserId() userId: string,@Body() data: UpdateAuthDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, user } = await this.authService.update(userId, data);

        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions = isProd
            ? {
                httpOnly: true,
                sameSite: 'none' as const,
                secure: true,
                domain: '.tehkly.com',
                maxAge: parseInt(process.env.MAX_AGE as string) || 1000 * 60 * 60 * 24,
            }
            : {
                httpOnly: true,
                sameSite: 'lax' as const,
                maxAge: parseInt(process.env.MAX_AGE as string) || 1000 * 60 * 60 * 24,
            };

        res.cookie('accessToken', accessToken, cookieOptions);
        
        return user;
    }
}
