import { Document, Types } from 'mongoose';
export type UdharDocument = Udhar & Document;
declare class UdharProduct {
    name: string;
    qty: number;
    price: number;
}
export declare class Udhar {
    id: string;
    customerId: number;
    date: string;
    type: string;
    desc: string;
    products: UdharProduct[];
    total: number;
    advance: number;
    udharAmt: number;
    shopId: Types.ObjectId;
}
export declare const UdharSchema: import("mongoose").Schema<Udhar, import("mongoose").Model<Udhar, any, any, any, any, any, Udhar>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, {
    id?: import("mongoose").SchemaDefinitionProperty<string, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    customerId?: import("mongoose").SchemaDefinitionProperty<number, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<string, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    desc?: import("mongoose").SchemaDefinitionProperty<string, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    products?: import("mongoose").SchemaDefinitionProperty<UdharProduct[], Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    total?: import("mongoose").SchemaDefinitionProperty<number, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    advance?: import("mongoose").SchemaDefinitionProperty<number, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    udharAmt?: import("mongoose").SchemaDefinitionProperty<number, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    shopId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Udhar, Document<unknown, {}, Udhar, {}, import("mongoose").DefaultSchemaOptions> & Udhar & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Udhar>;
export {};
