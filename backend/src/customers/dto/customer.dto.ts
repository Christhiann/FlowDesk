import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { InteractionType, SaleStatus } from '@prisma/client';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;
}

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateInteractionDto {
  @IsNotEmpty()
  @IsEnum(InteractionType)
  type: InteractionType;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  saleId?: string;
}

export class UpdateInteractionDto {
  @IsOptional()
  @IsEnum(InteractionType)
  type?: InteractionType;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateSaleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @IsNotEmpty()
  @IsUUID()
  customerId: string;
}

export class UpdateSaleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
