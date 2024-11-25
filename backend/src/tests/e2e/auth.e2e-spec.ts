// auth.e2e-spec.ts
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../modules/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/register (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'testuser@example.com',
                plainPassword: 'TestPassword123',
                firstName: 'Test',
                lastName: 'User',
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('email', 'testuser@example.com');
    });

    it('/auth/login (POST)', async () => {
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'loginuser@example.com',
                plainPassword: 'TestPassword123',
                firstName: 'Login',
                lastName: 'User',
            });

        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'loginuser@example.com',
                plainPassword: 'TestPassword123',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
