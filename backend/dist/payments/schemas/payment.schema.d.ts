import { Document } from 'mongoose';
export type PaymentDocument = Payment & Document;
export declare class Payment {
    id: string;
    shop: string;
    email: string;
    amount: number;
    plan: string;
    method?: string;
    date: string;
    status: string;
    month: string;
}
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, any, any, Payment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    id?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    shop?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    plan?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    method?: import("mongoose").SchemaDefinitionProperty<string | undefined, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    date?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    month?: import("mongoose").SchemaDefinitionProperty<string, Payment, Document<unknown, {}, Payment, {}, import("mongoose").DefaultSchemaOptions> & Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Payment>;
