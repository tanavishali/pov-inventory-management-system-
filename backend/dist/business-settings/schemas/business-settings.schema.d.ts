import { Document, Types } from 'mongoose';
export type BusinessSettingsDocument = BusinessSettings & Document;
export declare class BusinessSettings {
    userId: Types.ObjectId;
    businessName: string;
    ownerName: string;
    ownerPhone: string;
    businessPhone: string;
    businessEmail: string;
    businessAddress: string;
    ntn: string;
    strn: string;
    currency: string;
    financialYearStart: string;
    invoicePrefix: string;
    invoiceTax: number;
    invoiceFooter: string;
    brandName: string;
    logoSrc: string;
}
export declare const BusinessSettingsSchema: import("mongoose").Schema<BusinessSettings, import("mongoose").Model<BusinessSettings, any, any, any, any, any, BusinessSettings>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BusinessSettings, Document<unknown, {}, BusinessSettings, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    businessName?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ownerName?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ownerPhone?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    businessPhone?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    businessEmail?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    businessAddress?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ntn?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    strn?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    financialYearStart?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    invoicePrefix?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    invoiceTax?: import("mongoose").SchemaDefinitionProperty<number, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    invoiceFooter?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    brandName?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    logoSrc?: import("mongoose").SchemaDefinitionProperty<string, BusinessSettings, Document<unknown, {}, BusinessSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<BusinessSettings & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, BusinessSettings>;
