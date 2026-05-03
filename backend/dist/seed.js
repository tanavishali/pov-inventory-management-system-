"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const users_service_1 = require("./users/users.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
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
    }
    else {
        console.log('Super Admin user already exists.');
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map