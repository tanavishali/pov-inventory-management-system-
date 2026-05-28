import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Udhar, UdharDocument } from './schemas/udhar.schema';
import { Shop, ShopDocument } from '../shops/schemas/shop.schema';
import { CreateUdharDto } from './dto/create-udhar.dto';
import { UpdateUdharDto } from './dto/update-udhar.dto';

@Injectable()
export class UdharService {
  constructor(
    @InjectModel(Udhar.name) private udharModel: Model<UdharDocument>,
    @InjectModel(Shop.name) private shopModel: Model<ShopDocument>,
  ) {}

  async findAll(shopId: Types.ObjectId | string): Promise<UdharDocument[]> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;

    // Fetch active customer shops for this tenant
    const activeShops = await this.shopModel.find({ shopId: sId }).exec();
    const activeShopIds = new Set(activeShops.map(s => s.id));

    const entries = await this.udharModel.find({ shopId: sId }).sort({ createdAt: 1 }).exec();
    // Relational Filtering: only return entries belonging to currently active customer retail shops!
    return entries.filter(e => activeShopIds.has(e.customerId));
  }

  async create(shopId: Types.ObjectId | string, createUdharDto: CreateUdharDto): Promise<UdharDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;

    let transactionId = createUdharDto.id;

    if (!transactionId) {
      // Find highest transaction numeric ID for this shop to generate next sequential ID
      const entries = await this.udharModel.find({ shopId: sId }).exec();
      let maxId = 300;
      entries.forEach(e => {
        const num = parseInt(e.id);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      });
      transactionId = String(maxId + 1);
    }

    const newUdhar = new this.udharModel({
      ...createUdharDto,
      id: transactionId,
      shopId: sId,
    });

    return newUdhar.save();
  }

  async update(shopId: Types.ObjectId | string, id: string, updateUdharDto: UpdateUdharDto): Promise<UdharDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateUdharDto as any;

    const query = Types.ObjectId.isValid(id)
      ? { _id: new Types.ObjectId(id), shopId: sId }
      : { id, shopId: sId };

    const entry = await this.udharModel.findOneAndUpdate(
      query,
      safeUpdateData,
      { new: true },
    ).exec();

    if (!entry) {
      throw new NotFoundException(`Ledger entry with ID ${id} not found under this tenant`);
    }

    return entry;
  }

  async delete(shopId: Types.ObjectId | string, id: string): Promise<any> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    
    const query = Types.ObjectId.isValid(id)
      ? { _id: new Types.ObjectId(id), shopId: sId }
      : { id, shopId: sId };

    const result = await this.udharModel.deleteOne(query).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Ledger entry with ID ${id} not found under this tenant`);
    }

    return { message: 'Ledger entry deleted successfully', id };
  }
}
