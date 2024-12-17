import { Controller, Get, Post, Req, Res, Body, BadRequestException,UnauthorizedException,Patch, NotFoundException, Query } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Enable2FADto } from '../dtos/enable-2fa.dto';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ForgetPasswordDto } from '../dtos/forget-password.dto';
import { ResetPasswordDto } from '../dtos/password-reset.dto'; // Ensure this file exists at the specified path
import { UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';



@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @UseGuards(JwtAuthGuard)
    @Get('')
    async getProfile( @Req() req: any) {
      const userIdFromToken = req.user.sub;
      
  
      const user = await this.profileService.findById(userIdFromToken);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    }

    //patch user budget
    @UseGuards(JwtAuthGuard)
    @Patch('budgets')
    async updateBudgets(@Req() req: Request, @Body() budgets: Record<string, number>) {
      const userId = (req.user as any).sub;
      const updatedUser = await this.profileService.updateBudgets(userId, budgets);
      return { message: 'Budgets updated successfully', user: updatedUser };
    }

    


    @UseGuards(JwtAuthGuard)
    @Patch('update')
    async updateUser(
      
      @Body() updateUserDto: UpdateUserDto,
      @Req() req: Request,
    ) {
      const userIdFromToken = (req.user as any)?.sub; // Extract user ID from JWT payload

      
      const updatedUser = await this.profileService.update(userIdFromToken, updateUserDto);
      return { message: 'User updated successfully', user: updatedUser };
    }


}