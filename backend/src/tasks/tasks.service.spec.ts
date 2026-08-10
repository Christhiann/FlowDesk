import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role, TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let notificationsGateway: { notifyTaskReassigned: jest.Mock };

  const manager = { id: 'mgr-1', email: 'mgr@flowdesk.com', role: Role.MANAGER };
  const employee = { id: 'emp-1', email: 'emp@flowdesk.com', role: Role.EMPLOYEE };
  const otherEmployee = { id: 'emp-2', email: 'emp2@flowdesk.com', role: Role.EMPLOYEE };

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    notificationsGateway = {
      notifyTaskReassigned: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsGateway, useValue: notificationsGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => jest.clearAllMocks());

  it('filtra automaticamente as tarefas de um colaborador pelas atribuídas a ele', async () => {
    prisma.task.findMany.mockResolvedValue([]);
    await service.findAll(employee, {});

    const whereArg = prisma.task.findMany.mock.calls[0][0].where;
    expect(whereArg.assigneeId).toBe(employee.id);
  });

  it('não filtra tarefas de manager/admin por assigneeId automaticamente', async () => {
    prisma.task.findMany.mockResolvedValue([]);
    await service.findAll(manager, {});

    const whereArg = prisma.task.findMany.mock.calls[0][0].where;
    expect(whereArg.assigneeId).toBeUndefined();
  });

  it('impede colaborador de mover tarefa que não é dele', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 't1',
      assigneeId: otherEmployee.id,
      status: TaskStatus.TODO,
    });

    await expect(
      service.updateStatus(employee, 't1', TaskStatus.IN_PROGRESS),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite colaborador mover a própria tarefa no Kanban', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 't1',
      assigneeId: employee.id,
      status: TaskStatus.TODO,
    });
    prisma.task.update.mockResolvedValue({ id: 't1', status: TaskStatus.IN_PROGRESS });

    const result = await service.updateStatus(employee, 't1', TaskStatus.IN_PROGRESS);
    expect(result.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('impede colaborador de editar campos além do status', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 't1', assigneeId: employee.id });

    await expect(
      service.update(employee, 't1', { title: 'Novo título' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('impede colaborador de excluir tarefas', async () => {
    await expect(service.remove(employee, 't1')).rejects.toThrow(ForbiddenException);
  });

  it('lança NotFoundException ao excluir tarefa inexistente sendo manager', async () => {
    prisma.task.findUnique.mockResolvedValue(null);
    await expect(service.remove(manager, 'nao-existe')).rejects.toThrow(NotFoundException);
  });

  it('permite manager excluir tarefa existente', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 't1' });
    prisma.task.delete.mockResolvedValue({});

    const result = await service.remove(manager, 't1');
    expect(result.message).toContain('removida');
  });
});
