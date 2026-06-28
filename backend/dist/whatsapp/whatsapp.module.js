"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const whatsapp_service_1 = require("./whatsapp.service");
const whatsapp_gateway_1 = require("./whatsapp.gateway");
const whatsapp_controller_1 = require("./whatsapp.controller");
const user_schema_1 = require("../users/schemas/user.schema");
const shop_schema_1 = require("../shops/schemas/shop.schema");
const order_schema_1 = require("../orders/schemas/order.schema");
const udhar_schema_1 = require("../udhar/schemas/udhar.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const users_module_1 = require("../users/users.module");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: shop_schema_1.Shop.name, schema: shop_schema_1.ShopSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: udhar_schema_1.Udhar.name, schema: udhar_schema_1.UdharSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
            ]),
            users_module_1.UsersModule,
        ],
        controllers: [whatsapp_controller_1.WhatsappController],
        providers: [whatsapp_service_1.WhatsappService, whatsapp_gateway_1.WhatsappGateway],
        exports: [whatsapp_service_1.WhatsappService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map