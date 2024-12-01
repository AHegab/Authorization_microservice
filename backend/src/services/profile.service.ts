import { BadRequestException, Injectable, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { calculatePasswordEntropy } from '../utils/password.utils';


@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService, // Inject JwtService here
    ) { }



    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }



    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }


    async update(id: string, data: Partial<User>): Promise<User> {
        // Fetch the user from the database
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Update only the fields that are present in the `data` object
        Object.assign(user, data);

        // Save the updated user back to the database
        return await this.userRepository.save(user);
    }

}