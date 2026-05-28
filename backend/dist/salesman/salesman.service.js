"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesmanService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../users/schemas/user.schema");
let SalesmanService = class SalesmanService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findAll(shopId) {
        return this.userModel
            .find({ shopId: new mongoose_2.Types.ObjectId(shopId), role: 'salesman' })
            .sort({ createdAt: -1 })
            .exec();
    }
    async create(shopId, dto) {
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const createdSalesman = new this.userModel({
            ...dto,
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            role: 'salesman',
            shopId: new mongoose_2.Types.ObjectId(shopId),
            sales: 0,
            orders: 0,
        });
        return createdSalesman.save();
    }
    async update(shopId, id, dto) {
        const salesman = await this.userModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(id),
            shopId: new mongoose_2.Types.ObjectId(shopId),
            role: 'salesman',
        })
            .exec();
        if (!salesman) {
            throw new common_1.NotFoundException('Salesman not found under this tenant');
        }
        if (dto.email && dto.email.toLowerCase() !== salesman.email) {
            const emailTaken = await this.userModel
                .findOne({ email: dto.email.toLowerCase() })
                .exec();
            if (emailTaken) {
                throw new common_1.ConflictException('Email already taken by another user');
            }
            salesman.email = dto.email.toLowerCase();
        }
        if (dto.password) {
            salesman.password = await bcrypt.hash(dto.password, 10);
        }
        if (dto.name)
            salesman.name = dto.name;
        if (dto.phone)
            salesman.phone = dto.phone;
        if (dto.cnic !== undefined)
            salesman.cnic = dto.cnic;
        if (dto.joined !== undefined)
            salesman.joined = dto.joined;
        if (dto.status)
            salesman.status = dto.status;
        return salesman.save();
    }
    async delete(shopId, id) {
        const result = await this.userModel
            .findOneAndDelete({
            _id: new mongoose_2.Types.ObjectId(id),
            shopId: new mongoose_2.Types.ObjectId(shopId),
            role: 'salesman',
        })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException('Salesman not found under this tenant');
        }
        return { success: true };
    }
};
exports.SalesmanService = SalesmanService;
exports.SalesmanService = SalesmanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SalesmanService);
//# sourceMappingURL=salesman.service.js.map