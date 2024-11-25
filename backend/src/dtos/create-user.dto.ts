import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128)
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
