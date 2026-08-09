import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, TaskStatus, Priority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { NotificationsGateway } from '../notifications/notifications.gateway';

interface FindAllFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
}

const MANAGEMENT_ROLES: Role[] = [Role.ADMIN, Role.MANAGER];

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private notificationsGateway: NotificationsGateway) {}

  async create(user: AuthenticatedUser, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? Priority.MEDIUM,
        status: dto.status ?? TaskStatus.TODO,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        createdById: user.id,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(user: AuthenticatedUser, filters: FindAllFilters) {
    // Colaborador só enxerga as tarefas atribuídas a ele; admin/manager vê tudo.
    const scopedFilter = MANAGEMENT_ROLES.includes(user.role) ? {} : { assigneeId: user.id };

    return this.prisma.task.findMany({
      where: {
        ...scopedFilter,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    this.assertCanView(user, task.assigneeId);
    return task;
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (!MANAGEMENT_ROLES.includes(user.role)) {
      // Colaborador só pode alterar o status das próprias tarefas (fluxo do Kanban),
      // não pode reatribuir, mudar prioridade ou editar título/descrição.
      if (task.assigneeId !== user.id) {
        throw new ForbiddenException('Você só pode alterar tarefas atribuídas a você');
      }
      const allowedFields = Object.keys(dto);
      const onlyStatus = allowedFields.every((field) => field === 'status');
      if (!onlyStatus) {
        throw new ForbiddenException('Colaboradores só podem atualizar o status da tarefa');
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });

    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      this.notificationsGateway.notifyTaskReassigned(dto.assigneeId, updatedTask.id, updatedTask.title);
    }

    return updatedTask;
  }

  async updateStatus(user: AuthenticatedUser, id: string, status: TaskStatus) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    const isManagement = MANAGEMENT_ROLES.includes(user.role);
    if (!isManagement && task.assigneeId !== user.id) {
      throw new ForbiddenException('Você só pode mover tarefas atribuídas a você');
    }

    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(user: AuthenticatedUser, id: string) {
    if (!MANAGEMENT_ROLES.includes(user.role)) {
      throw new ForbiddenException('Apenas administradores e gerentes podem excluir tarefas');
    }

    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Tarefa removida com sucesso' };
  }

  private assertCanView(user: AuthenticatedUser, assigneeId: string | null) {
    if (MANAGEMENT_ROLES.includes(user.role)) return;
    if (assigneeId !== user.id) {
      throw new ForbiddenException('Você não tem acesso a esta tarefa');
    }
  }
}
