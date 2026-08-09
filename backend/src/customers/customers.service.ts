import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreateCustomerDto, CreateContactDto, CreateInteractionDto, UpdateCustomerDto, UpdateInteractionDto } from './dto/customer.dto';
import { Role } from '@prisma/client';

const MANAGEMENT_ROLES: Role[] = [Role.ADMIN, Role.MANAGER];

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(user: AuthenticatedUser, dto: CreateCustomerDto) {
    this.assertManagement(user);
    return this.prisma.customer.create({
      data: {
        ...dto,
        createdById: user.id,
      },
    });
  }

  async findAllCustomers(user: AuthenticatedUser) {
    if (MANAGEMENT_ROLES.includes(user.role)) {
      return this.prisma.customer.findMany({
        include: {
          contacts: true,
          interactions: true,
          sales: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    }

    return this.prisma.customer.findMany({
      where: { createdById: user.id },
      include: {
        contacts: true,
        interactions: true,
        sales: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOneCustomer(user: AuthenticatedUser, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        interactions: true,
        sales: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    if (!MANAGEMENT_ROLES.includes(user.role) && customer.createdById !== user.id) {
      throw new ForbiddenException('Você não tem permissão para ver este cliente');
    }
    return customer;
  }

  async updateCustomer(user: AuthenticatedUser, id: string, dto: UpdateCustomerDto) {
    this.assertManagement(user);
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async removeCustomer(user: AuthenticatedUser, id: string) {
    this.assertManagement(user);
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Cliente removido com sucesso' };
  }

  async addContact(user: AuthenticatedUser, customerId: string, dto: CreateContactDto) {
    this.assertManagement(user);
    await this.assertCustomerExists(customerId);
    return this.prisma.contact.create({ data: { ...dto, customerId } });
  }

  async addInteraction(user: AuthenticatedUser, customerId: string, dto: CreateInteractionDto) {
    await this.assertCustomerExists(customerId);
    if (!MANAGEMENT_ROLES.includes(user.role) && dto.customerId && dto.customerId !== customerId) {
      throw new ForbiddenException('Você não pode registrar interação para outro cliente');
    }
    return this.prisma.interaction.create({
      data: {
        ...dto,
        customerId,
        createdById: user.id,
        occurredAt: new Date(),
      },
    });
  }

  async updateInteraction(user: AuthenticatedUser, id: string, dto: UpdateInteractionDto) {
    const interaction = await this.prisma.interaction.findUnique({ where: { id } });
    if (!interaction) {
      throw new NotFoundException('Interação não encontrada');
    }
    if (!MANAGEMENT_ROLES.includes(user.role) && interaction.createdById !== user.id) {
      throw new ForbiddenException('Você não pode atualizar esta interação');
    }
    return this.prisma.interaction.update({ where: { id }, data: dto });
  }

  async listCustomerInteractions(user: AuthenticatedUser, customerId: string) {
    await this.assertCustomerExists(customerId);
    return this.prisma.interaction.findMany({
      where: { customerId },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { occurredAt: 'desc' },
    });
  }

  private assertManagement(user: AuthenticatedUser) {
    if (!MANAGEMENT_ROLES.includes(user.role)) {
      throw new ForbiddenException('Apenas administradores e gerentes podem executar esta ação');
    }
  }

  private async assertCustomerExists(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }
}
