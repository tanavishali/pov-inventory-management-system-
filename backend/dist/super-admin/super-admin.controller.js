"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("../users/users.service");
const admin_management_dto_1 = require("../users/dto/admin-management.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let SuperAdminController = class SuperAdminController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    createAdmin(createAdminDto) {
        return this.usersService.create({
            ...createAdminDto,
            role: 'admin',
        });
    }
    findAll() {
        return this.usersService.findAllAdmins();
    }
    update(id, updateAdminDto) {
        const { password, ...safeData } = updateAdminDto;
        const dataToUpdate = (password && !password.startsWith('$2b$') && !password.startsWith('$2a$'))
            ? { ...safeData, password }
            : safeData;
        return this.usersService.update(id, dataToUpdate);
    }
    remove(id) {
        return this.usersService.delete(id);
    }
    async renew(id, body) {
        const user = await this.usersService.findById(id);
        if (!user)
            return { message: 'User not found' };
        const safeDays = (body?.days && body.days > 0) ? body.days : 30;
        const currentExpiry = user.expiryDate ? new Date(user.expiryDate) : new Date();
        currentExpiry.setDate(currentExpiry.getDate() + safeDays);
        return this.usersService.update(id, {
            expiryDate: currentExpiry.toISOString().split('T')[0],
            status: 'Active',
            feeStatus: 'Paid',
        });
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Post)('admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Shop Admin (Shop Owner)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_management_dto_1.CreateAdminDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('admins'),
    (0, swagger_1.ApiOperation)({ summary: 'List all Shop Admins' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('admins/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Shop Admin details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_management_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admins/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a Shop Admin' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('admins/:id/renew'),
    (0, swagger_1.ApiOperation)({ summary: 'Renew or extend Shop Admin subscription' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_management_dto_1.RenewAdminDto]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "renew", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super-admin'),
    (0, common_1.Controller)('super-admin'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map