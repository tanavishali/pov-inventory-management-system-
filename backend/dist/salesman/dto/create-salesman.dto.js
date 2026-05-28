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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSalesmanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSalesmanDto {
    name;
    email;
    password;
    phone;
    cnic;
    joined;
    status;
}
exports.CreateSalesmanDto = CreateSalesmanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ahmed Khan' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ahmed@sales.com' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ahmed@123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+92-300-1234567' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '35202-1234567-1', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "cnic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "joined", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Active', 'Locked', 'Demo'], default: 'Active', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['Active', 'Locked', 'Demo']),
    __metadata("design:type", String)
], CreateSalesmanDto.prototype, "status", void 0);
//# sourceMappingURL=create-salesman.dto.js.map