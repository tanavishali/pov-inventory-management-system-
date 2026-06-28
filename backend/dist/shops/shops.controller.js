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
exports.ShopsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shops_service_1 = require("./shops.service");
const users_service_1 = require("../users/users.service");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const update_shop_dto_1 = require("./dto/update-shop.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ShopsController = class ShopsController {
    shopsService;
    usersService;
    constructor(shopsService, usersService) {
        this.shopsService = shopsService;
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
        return this.shopsService.findAll(shopId, search, status);
    }
    async create(req, createShopDto) {
        const shopId = await this.getShopId(req);
        return this.shopsService.create(shopId, createShopDto);
    }
    async update(req, id, updateShopDto) {
        const shopId = await this.getShopId(req);
        return this.shopsService.update(shopId, id, updateShopDto);
    }
    async remove(req, id) {
        const shopId = await this.getShopId(req);
        return this.shopsService.delete(shopId, id);
    }
};
exports.ShopsController = ShopsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customer retail shops for the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new customer retail shop to the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_shop_dto_1.CreateShopDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a customer retail shop in the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_shop_dto_1.UpdateShopDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a customer retail shop from the current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "remove", null);
exports.ShopsController = ShopsController = __decorate([
    (0, swagger_1.ApiTags)('Shops'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('shops'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService,
        users_service_1.UsersService])
], ShopsController);
//# sourceMappingURL=shops.controller.js.map