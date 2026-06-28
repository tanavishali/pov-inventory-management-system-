import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuperAdminController } from './super-admin/super-admin.controller';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ShopsModule } from './shops/shops.module';
import { UdharModule } from './udhar/udhar.module';
import { SalesmanModule } from './salesman/salesman.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { BusinessSettingsModule } from './business-settings/business-settings.module';
import { ReportsModule } from './reports/reports.module';
import { BookingsModule } from './bookings/bookings.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PaymentsModule,
    ProductsModule,
    OrdersModule,
    ShopsModule,
    UdharModule,
    SalesmanModule,
    DashboardModule,
    WhatsappModule,
    BusinessSettingsModule,
    ReportsModule,
    BookingsModule,
  ],
  controllers: [AppController, SuperAdminController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
