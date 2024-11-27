import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';
import { createClient } from 'redis';
 // Load environment variables from .env file




async function bootstrap() {

    dotenv.config();
    

    


    const app = await NestFactory.create(AppModule);

    // Add session middleware
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'default-secret', // Replace with your secure secret
            resave: false, // Avoid resaving session if unmodified
            saveUninitialized: false, // Don't save empty sessions
            cookie: {
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 1000 * 60 * 60 * 24, // 1 day
            },
        }),
    );

    await app.listen(3000);
    console.log(`Auth Service is running on http://localhost:3000`);
}

bootstrap();
