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
exports.RenewAdminDto = exports.UpdateAdminDto = exports.CreateAdminDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAdminDto {
    name;
    email;
    password;
    plan;
    monthlyFee;
    status;
    expiryDate;
}
exports.CreateAdminDto = CreateAdminDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Al-Falah General Store' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'shop@email.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' }),
    (0, class_validator_1.IsEnum)(['Basic', 'Premium', 'Enterprise']),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1500 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAdminDto.prototype, "monthlyFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Active', 'Locked', 'Demo'], default: 'Active' }),
    (0, class_validator_1.IsEnum)(['Active', 'Locked', 'Demo']),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-31', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "expiryDate", void 0);
class UpdateAdminDto {
    name;
    email;
    plan;
    monthlyFee;
    status;
    feeStatus;
    expiryDate;
}
exports.UpdateAdminDto = UpdateAdminDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Basic', 'Premium', 'Enterprise'], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAdminDto.prototype, "monthlyFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Active', 'Locked', 'Demo'], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Paid', 'Unpaid', 'Overdue'], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['Paid', 'Unpaid', 'Overdue']),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "feeStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "expiryDate", void 0);
class RenewAdminDto {
    days;
}
exports.RenewAdminDto = RenewAdminDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30, description: 'Number of days to extend the subscription', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RenewAdminDto.prototype, "days", void 0);
//# sourceMappingURL=admin-management.dto.js.map