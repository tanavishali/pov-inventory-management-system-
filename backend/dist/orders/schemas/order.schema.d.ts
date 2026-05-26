import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
declare class OrderProduct {
    name: string;
    qty: number;
    price: number;
    ctn: number;
}
export declare class Order {
    id: string;
    status: string;
    customer: string;
    shop: string;
    phone?: string;
    salesman?: string;
    payment: string;
    advance?: number;
    date: string;
    time: string;
    products: OrderProduct[];
    shopId: Types.ObjectId;
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, any, any, Order>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, {
    id?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    customer?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    shop?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string | undefined, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    salesman?: import("mongoose").SchemaDefinitionProperty<string | undefined, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    payment?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    advance?: import("mongoose").SchemaDefinitionProperty<number | undefined, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    time?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    products?: import("mongoose").SchemaDefinitionProperty<OrderProduct[], Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    shopId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Order, Document<unknown, {}, Order, {}, import("mongoose").DefaultSchemaOptions> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Order>;
export {};
