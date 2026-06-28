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
exports.UpdateBusinessSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateBusinessSettingsDto {
    businessName;
    ownerName;
    ownerPhone;
    businessPhone;
    businessEmail;
    businessAddress;
    ntn;
    strn;
    currency;
    financialYearStart;
    invoicePrefix;
    invoiceTax;
    invoiceFooter;
    brandName;
    logoSrc;
}
exports.UpdateBusinessSettingsDto = UpdateBusinessSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WholesalePro Distributors' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Muhammad Ali' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '03246770536' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "ownerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+92-42-1234567' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "businessPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'info@wholesalepro.pk' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Main Boulevard, Gulberg III, Lahore' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234567-8' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "ntn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '42-00-1234-567-89' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "strn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'PKR — Pakistani Rupee (Rs)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'July' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "financialYearStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'INV-' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "invoicePrefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 17 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBusinessSettingsDto.prototype, "invoiceTax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Thank you for your business. Goods once sold will not be returned.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "invoiceFooter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WholesalePro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'data:image/png;base64,...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessSettingsDto.prototype, "logoSrc", void 0);
//# sourceMappingURL=update-business-settings.dto.js.map