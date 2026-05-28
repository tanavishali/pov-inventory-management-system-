import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UdharService } from './udhar.service';
import { UdharController } from './udhar.controller';
import { Udhar, UdharSchema } from './schemas/udhar.schema';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Udhar.name, schema: UdharSchema },
      { name: Shop.name, schema: ShopSchema }
    ]),
    UsersModule,
  ],
  controllers: [UdharController],
  providers: [UdharService],
  exports: [UdharService],
})
export class UdharModule {}
