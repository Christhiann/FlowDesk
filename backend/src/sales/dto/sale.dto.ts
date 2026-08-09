import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { SaleStatus } from '@prisma/client';

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
