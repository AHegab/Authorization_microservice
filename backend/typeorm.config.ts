import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import * as dotenv from 'dotenv';


dotenv.config();


console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'auth_service',
    schema: 'User', // Specify the schema here
    entities: [User], // Include your entities
    synchronize: true, // Always use migrations in production
    logging: true,
});
