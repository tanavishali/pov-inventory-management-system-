import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Udhar, UdharSchema } from '../udhar/schemas/udhar.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Udhar.name, schema: UdharSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    UsersModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappGateway],
  exports: [WhatsappService],
})
export class WhatsappModule {}
