import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail() // Validates that the email follows a proper format
    email: string;

    @IsString()
    @IsNotEmpty() // Ensures the password is not empty
    password: string;
}
