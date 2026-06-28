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
exports.SalesmanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const salesman_service_1 = require("./salesman.service");
const users_service_1 = require("../users/users.service");
const create_salesman_dto_1 = require("./dto/create-salesman.dto");
const update_salesman_dto_1 = require("./dto/update-salesman.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SalesmanController = class SalesmanController {
    salesmanService;
    usersService;
    constructor(salesmanService, usersService) {
        this.salesmanService = salesmanService;
        this.usersService = usersService;
    }
    async getShopId(req) {
        const user = await this.usersService.findById(req.user.id);
        if (!user)
            return req.user.id;
        return user.role === 'admin' ? user._id.toString() : user.shopId?.toString() || req.user.id;
    }
    async findAll(req, search, status) {
        const shopId = await this.getShopId(req);
        return this.salesmanService.findAll(shopId, search, status);
    }
    async create(req, createSalesmanDto) {
        const shopId = await this.getShopId(req);
        return this.salesmanService.create(shopId, createSalesmanDto);
    }
    async update(req, id, updateSalesmanDto) {
        const shopId = await this.getShopId(req);
        return this.salesmanService.update(shopId, id, updateSalesmanDto);
    }
    async remove(req, id) {
        const shopId = await this.getShopId(req);
        return this.salesmanService.delete(shopId, id);
    }
};
exports.SalesmanController = SalesmanController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all salesmen for the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new salesman under the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_salesman_dto_1.CreateSalesmanDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a salesman under the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_salesman_dto_1.UpdateSalesmanDto]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a salesman from the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesmanController.prototype, "remove", null);
exports.SalesmanController = SalesmanController = __decorate([
    (0, swagger_1.ApiTags)('Salesman'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('salesman'),
    __metadata("design:paramtypes", [salesman_service_1.SalesmanService,
        users_service_1.UsersService])
], SalesmanController);
//# sourceMappingURL=salesman.controller.js.map