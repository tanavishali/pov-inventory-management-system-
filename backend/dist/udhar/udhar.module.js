"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UdharModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const udhar_service_1 = require("./udhar.service");
const udhar_controller_1 = require("./udhar.controller");
const udhar_schema_1 = require("./schemas/udhar.schema");
const shop_schema_1 = require("../shops/schemas/shop.schema");
const users_module_1 = require("../users/users.module");
let UdharModule = class UdharModule {
};
exports.UdharModule = UdharModule;
exports.UdharModule = UdharModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: udhar_schema_1.Udhar.name, schema: udhar_schema_1.UdharSchema },
                { name: shop_schema_1.Shop.name, schema: shop_schema_1.ShopSchema }
            ]),
            users_module_1.UsersModule,
        ],
        controllers: [udhar_controller_1.UdharController],
        providers: [udhar_service_1.UdharService],
        exports: [udhar_service_1.UdharService],
    })
], UdharModule);
//# sourceMappingURL=udhar.module.js.map