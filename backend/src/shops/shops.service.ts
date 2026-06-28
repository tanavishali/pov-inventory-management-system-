import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shop, ShopDocument } from './schemas/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

// const INITIAL_SHOPS = [
//   { name: 'Hassan Electronics Store', owner: 'Ali Hassan',   phone: '+92 300 1234567', cnic: '42101-1234567-1', address: 'Main Market, Mall Road',    city: 'Lahore',     status: 'active',  created: '2024-01-15' },
//   { name: 'Sana General Store',        owner: 'Sana Bibi',    phone: '+92 321 9876543', cnic: '42201-9876543-2', address: 'Block B, Model Town',       city: 'Lahore',     status: 'active',  created: '2024-02-20' },
//   { name: 'Khan Brothers Depot',       owner: 'Zubair Khan',  phone: '+92 333 5556677', cnic: '54301-5556677-3', address: 'GT Road, Near Toll Plaza',   city: 'Gujranwala', status: 'active',  created: '2024-03-10' },
//   { name: 'City Wholesale Market',     owner: 'Kamran Malik', phone: '+92 345 1112233', cnic: '35202-1112233-4', address: 'Circular Road, Saddar',      city: 'Rawalpindi', status: 'blocked', created: '2023-11-05' },
//   { name: 'Raza Trading Co.',          owner: 'Abdul Raza',   phone: '+92 311 7778899', cnic: '42101-7778899-5', address: 'Urdu Bazar, Old City',       city: 'Lahore',     status: 'active',  created: '2024-04-01' },
//   { name: 'Al-Noor Provisions',        owner: 'Noor ul Haq',  phone: '+92 312 4445566', cnic: '42201-4445566-6', address: 'Link Road, Gulshan Iqbal',   city: 'Karachi',    status: 'blocked', created: '2023-09-22' },
// ];

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name) private shopModel: Model<ShopDocument>,
  ) {}

  async findAll(shopId: Types.ObjectId | string, search?: string, status?: string): Promise<ShopDocument[]> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;
    const query: any = { shopId: sId };
    if (status && status !== 'all') query.status = status;
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ name: re }, { owner: re }, { city: re }, { phone: re }];
    }
    return this.shopModel.find(query).sort({ id: 1 }).exec();
  }

  async create(shopId: Types.ObjectId | string, createShopDto: CreateShopDto): Promise<ShopDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;

    // Auto-increment shop numeric id scoped per parent shopId
    const shops = await this.shopModel.find({ shopId: sId }).exec();
    const ids = shops.map(s => s.id).filter(id => id > 0);
    const maxId = ids.length ? Math.max(...ids) : 0;
    const nextId = maxId + 1;

    const today = new Date().toISOString().split('T')[0];

    const newShop = new this.shopModel({
      ...createShopDto,
      id: nextId,
      created: today,
      shopId: sId,
      status: createShopDto.status || 'active',
    });

    return newShop.save();
  }

  async update(shopId: Types.ObjectId | string, id: number, updateShopDto: UpdateShopDto): Promise<ShopDocument> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;

    // Strip out database metadata fields
    const { _id, id: bodyId, shopId: bodyShopId, createdAt, updatedAt, __v, ...safeUpdateData } = updateShopDto as any;

    const shop = await this.shopModel.findOneAndUpdate(
      { id, shopId: sId },
      safeUpdateData,
      { new: true },
    ).exec();

    if (!shop) {
      throw new NotFoundException(`Customer shop with ID ${id} not found under this tenant`);
    }

    return shop;
  }

  async delete(shopId: Types.ObjectId | string, id: number): Promise<any> {
    const sId = typeof shopId === 'string' ? new Types.ObjectId(shopId) : shopId;

    const result = await this.shopModel.deleteOne({ id, shopId: sId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Customer shop with ID ${id} not found under this tenant`);
    }

    // Cascade delete any Udhar credit ledger entries for this deleted customer
    try {
      await this.shopModel.db.collection('udhars').deleteMany({ customerId: id, shopId: sId });
    } catch (e) {
      console.error('Failed to cascade delete udhars:', e);
    }

    return { message: 'Customer shop deleted successfully', id };
  }
}
