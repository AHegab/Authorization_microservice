import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

dotenv.config(); // Ensure environment variables are loaded

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
  url: process.env.DB_DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
    // To:
    ca: fs.readFileSync('ca-certificate.crt').toString(),
  },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};