import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail() // Validates email format
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 128) // Enforces password length constraints
  hashedPassword?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @Matches(/^\d{10}$/) // Validates phone number format
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
