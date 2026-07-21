import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Super Admin Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super-admin')
@Controller('super-admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payment records (paginated)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findAllPaginated({ page: Number(page), limit: Number(limit), status, search });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pending payment record' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark a payment record as Paid' })
  markAsPaid(@Param('id') id: string, @Body() markPaidDto: MarkPaidDto) {
    return this.paymentsService.markAsPaid(id, markPaidDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment record' })
  remove(@Param('id') id: string) {
    return this.paymentsService.delete(id);
  }
}
