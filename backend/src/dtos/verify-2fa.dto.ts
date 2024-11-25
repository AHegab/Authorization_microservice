import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FADto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string; // The OTP entered by the user
}
