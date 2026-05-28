import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesmanService } from './salesman.service';
import { SalesmanController } from './salesman.controller';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
  ],
  controllers: [SalesmanController],
  providers: [SalesmanService],
  exports: [SalesmanService],
})
export class SalesmanModule {}
