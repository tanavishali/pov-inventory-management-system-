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
exports.BusinessSettingsSchema = exports.BusinessSettings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let BusinessSettings = class BusinessSettings {
    userId;
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
};
exports.BusinessSettings = BusinessSettings;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, unique: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], BusinessSettings.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'WholesalePro Distributors' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "businessName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "ownerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "ownerPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '+92-42-1234567' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "businessPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'info@wholesalepro.pk' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "businessEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Main Boulevard, Gulberg III, Lahore' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "businessAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "ntn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "strn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'PKR — Pakistani Rupee (Rs)' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'July' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "financialYearStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'INV-' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "invoicePrefix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 17 }),
    __metadata("design:type", Number)
], BusinessSettings.prototype, "invoiceTax", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Thank you for your business. Goods once sold will not be returned.' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "invoiceFooter", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'WholesalePro' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "brandName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "logoSrc", void 0);
exports.BusinessSettings = BusinessSettings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BusinessSettings);
exports.BusinessSettingsSchema = mongoose_1.SchemaFactory.createForClass(BusinessSettings);
//# sourceMappingURL=business-settings.schema.js.map