import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Public — demo/booking requests from the marketing site
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a demo / booking request (public)' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  // Protected — super-admin manages incoming leads
  @UseGuards(RolesGuard)
  @Roles('super-admin')
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'List all booking requests (super-admin)' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('super-admin')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking status (super-admin)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, dto.status);
  }

  @UseGuards(RolesGuard)
  @Roles('super-admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking (super-admin)' })
  remove(@Param('id') id: string) {
    return this.bookingsService.delete(id);
  }
}
