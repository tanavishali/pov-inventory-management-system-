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
exports.UdharSchema = exports.Udhar = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UdharProduct = class UdharProduct {
    name;
    qty;
    price;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UdharProduct.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], UdharProduct.prototype, "qty", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], UdharProduct.prototype, "price", void 0);
UdharProduct = __decorate([
    (0, mongoose_1.Schema)()
], UdharProduct);
const UdharProductSchema = mongoose_1.SchemaFactory.createForClass(UdharProduct);
let Udhar = class Udhar {
    id;
    customerId;
    date;
    type;
    desc;
    products;
    total;
    advance;
    udharAmt;
    shopId;
};
exports.Udhar = Udhar;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Udhar.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Udhar.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Udhar.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['udhar', 'payment'] }),
    __metadata("design:type", String)
], Udhar.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Udhar.prototype, "desc", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [UdharProductSchema], default: [] }),
    __metadata("design:type", Array)
], Udhar.prototype, "products", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Udhar.prototype, "total", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Udhar.prototype, "advance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Udhar.prototype, "udharAmt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Udhar.prototype, "shopId", void 0);
exports.Udhar = Udhar = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Udhar);
exports.UdharSchema = mongoose_1.SchemaFactory.createForClass(Udhar);
//# sourceMappingURL=udhar.schema.js.map