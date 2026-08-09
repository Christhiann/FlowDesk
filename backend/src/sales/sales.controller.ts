import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sale.dto';
import { Role } from '@prisma/client';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get('stats')
  getStats() {
    return this.salesService.findStats();
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSaleDto) {
    return this.salesService.create(user.id, dto);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSaleDto) {
    return this.salesService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
