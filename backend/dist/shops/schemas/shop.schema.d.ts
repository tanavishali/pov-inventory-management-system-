import { Document, Types } from 'mongoose';
export type ShopDocument = Shop & Document;
export declare class Shop {
    id: number;
    name: string;
    owner: string;
    phone: string;
    cnic?: string;
    address?: string;
    city?: string;
    status: string;
    created: string;
    shopId: Types.ObjectId;
}
export declare const ShopSchema: import("mongoose").Schema<Shop, import("mongoose").Model<Shop, any, any, any, any, any, Shop>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, {
    id?: import("mongoose").SchemaDefinitionProperty<number, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    owner?: import("mongoose").SchemaDefinitionProperty<string, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    cnic?: import("mongoose").SchemaDefinitionProperty<string | undefined, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    address?: import("mongoose").SchemaDefinitionProperty<string | undefined, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string | undefined, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    created?: import("mongoose").SchemaDefinitionProperty<string, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    shopId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Shop, Document<unknown, {}, Shop, {}, import("mongoose").DefaultSchemaOptions> & Shop & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Shop>;
