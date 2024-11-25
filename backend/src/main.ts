import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';
import { createClient } from 'redis';


async function bootstrap() {

    dotenv.config();
    

    //create the jwt secret key
    


    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.use(
        session({
            
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true, // Helps mitigate XSS attacks
                secure: false, // Set to true in production
            },
        }),
    );
    




    




    await app.listen(3000);
    console.log('Auth Service is running on http://localhost:3000');
}
bootstrap();
