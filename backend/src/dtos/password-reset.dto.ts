import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {

    @IsNotEmpty()
    @MinLength(12)
    newPassword: string;
}
