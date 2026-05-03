import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const superAdminEmail = 'super@pos.com';
  const existingUser = await usersService.findByEmail(superAdminEmail);

  if (!existingUser) {
    await usersService.create({
      name: 'Master Owner',
      email: superAdminEmail,
      password: 'super123',
      role: 'super-admin',
      status: 'Active',
    });
    console.log('Super Admin user created successfully!');
  } else {
    console.log('Super Admin user already exists.');
  }

  await app.close();
}
bootstrap();
