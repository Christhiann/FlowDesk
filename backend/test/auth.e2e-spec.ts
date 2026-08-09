import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

/**
 * Requer um banco Postgres de teste rodando (ver docker-compose.yml).
 * Rode com: npm run test:e2e
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  const testEmail = `teste.${Date.now()}@flowdesk.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registra um novo usuário e retorna access token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Teste E2E',
      email: testEmail,
      password: 'Senha@123',
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
  });

  it('rejeita login com senha errada', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: testEmail,
      password: 'senhaErrada',
    });

    expect(res.status).toBe(401);
  });

  it('faz login e acessa rota protegida com o access token', async () => {
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: testEmail,
      password: 'Senha@123',
    });

    expect(login.status).toBe(200);
    const { accessToken } = login.body;

    const tasksRes = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(tasksRes.status).toBe(200);
    expect(Array.isArray(tasksRes.body)).toBe(true);
  });

  it('bloqueia rota protegida sem token', async () => {
    const res = await request(app.getHttpServer()).get('/tasks');
    expect(res.status).toBe(401);
  });
});
