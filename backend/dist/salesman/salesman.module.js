"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesmanModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const salesman_service_1 = require("./salesman.service");
const salesman_controller_1 = require("./salesman.controller");
const users_module_1 = require("../users/users.module");
const user_schema_1 = require("../users/schemas/user.schema");
let SalesmanModule = class SalesmanModule {
};
exports.SalesmanModule = SalesmanModule;
exports.SalesmanModule = SalesmanModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
            users_module_1.UsersModule,
        ],
        controllers: [salesman_controller_1.SalesmanController],
        providers: [salesman_service_1.SalesmanService],
        exports: [salesman_service_1.SalesmanService],
    })
], SalesmanModule);
//# sourceMappingURL=salesman.module.js.map