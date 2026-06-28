import { Document, Types } from 'mongoose';
export type ProductDocument = Product & Document;
export declare class Product {
    id: number;
    name: string;
    cat: string;
    purchase: number;
    selling: number;
    stock: number;
    threshold: number;
    ctn: number;
    shopId: Types.ObjectId;
}
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, any, any, Product>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, {
    id?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    cat?: import("mongoose").SchemaDefinitionProperty<string, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    purchase?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    selling?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    stock?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    threshold?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    ctn?: import("mongoose").SchemaDefinitionProperty<number, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    shopId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Product, Document<unknown, {}, Product, {}, import("mongoose").DefaultSchemaOptions> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Product>;
