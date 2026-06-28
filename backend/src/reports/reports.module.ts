import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { ShopsModule } from '../shops/shops.module';
import { SalesmanModule } from '../salesman/salesman.module';

@Module({
  imports: [UsersModule, OrdersModule, ShopsModule, SalesmanModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
