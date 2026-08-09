import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const baseUser = {
    id: 'user-1',
    name: 'Ana Silva',
    email: 'ana@empresa.com',
    role: Role.EMPLOYEE,
    refreshTokenHash: null as string | null,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token-fake') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('valor-fake') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('cria um usuário com senha hasheada quando o e-mail não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...baseUser, password: 'hashed' });
      prisma.user.update.mockResolvedValue({});

      const result = await service.register({
        name: 'Ana Silva',
        email: 'ana@empresa.com',
        password: 'Senha@123',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data.password).not.toBe('Senha@123');
      expect(createArgs.data.role).toBe(Role.EMPLOYEE);
      expect(result.user.email).toBe('ana@empresa.com');
      expect(result.accessToken).toBe('token-fake');
    });

    it('lança ConflictException se o e-mail já estiver cadastrado', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);

      await expect(
        service.register({ name: 'Ana', email: 'ana@empresa.com', password: 'Senha@123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('lança UnauthorizedException para e-mail inexistente', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@x.com', password: 'Senha@123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lança UnauthorizedException para senha incorreta', async () => {
      const hashed = await bcrypt.hash('SenhaCorreta@1', 10);
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, password: hashed });

      await expect(
        service.login({ email: baseUser.email, password: 'SenhaErrada' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('retorna tokens quando as credenciais estão corretas', async () => {
      const hashed = await bcrypt.hash('Senha@123', 10);
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, password: hashed });
      prisma.user.update.mockResolvedValue({});

      const result = await service.login({ email: baseUser.email, password: 'Senha@123' });

      expect(result.accessToken).toBe('token-fake');
      expect(result.refreshToken).toBe('token-fake');
      expect(result.user.id).toBe(baseUser.id);
    });
  });

  describe('refresh', () => {
    it('lança UnauthorizedException se não houver refresh token armazenado', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, refreshTokenHash: null });

      await expect(service.refresh(baseUser.id, 'algum-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('emite novos tokens quando o refresh token confere', async () => {
      const rawToken = 'refresh-valido';
      const hash = await bcrypt.hash(rawToken, 10);
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, refreshTokenHash: hash });
      prisma.user.update.mockResolvedValue({});

      const result = await service.refresh(baseUser.id, rawToken);
      expect(result.accessToken).toBe('token-fake');
    });
  });
});
