import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, CreateContactDto, CreateInteractionDto, UpdateCustomerDto, UpdateInteractionDto } from './dto/customer.dto';
import { Role } from '@prisma/client';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCustomerDto) {
    return this.customersService.createCustomer(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.customersService.findAllCustomers(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.findOneCustomer(user, id);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.updateCustomer(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.removeCustomer(user, id);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post(':id/contacts')
  addContact(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CreateContactDto) {
    return this.customersService.addContact(user, id, dto);
  }

  @Post(':id/interactions')
  addInteraction(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CreateInteractionDto) {
    return this.customersService.addInteraction(user, id, dto);
  }

  @Get(':id/interactions')
  listInteractions(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.listCustomerInteractions(user, id);
  }

  @Patch('interactions/:id')
  updateInteraction(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateInteractionDto) {
    return this.customersService.updateInteraction(user, id, dto);
  }
}
