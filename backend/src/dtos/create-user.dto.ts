import { IsDate, IsEmail,MinLength, IsNotEmpty, IsOptional, IsString, Matches, Length, minLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  plainPassword: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsDate()
  birthDay?: Date;

  @IsOptional()
  @Matches(/^\d{11}$/)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  
}
