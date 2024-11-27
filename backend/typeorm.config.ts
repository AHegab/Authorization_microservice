import { User } from './src/entities/user.entity';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

dotenv.config();




const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('backend/ca-certificate.crt').toString(),
  },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});

export default dataSource;
