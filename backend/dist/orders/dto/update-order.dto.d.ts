declare class UpdateOrderProductDto {
    name?: string;
    qty?: number;
    price?: number;
    ctn?: number;
}
export declare class UpdateOrderDto {
    customer?: string;
    shop?: string;
    phone?: string;
    salesman?: string;
    payment?: string;
    advance?: number;
    status?: string;
    products?: UpdateOrderProductDto[];
    _id?: any;
    id?: any;
    shopId?: any;
    createdAt?: any;
    updatedAt?: any;
    __v?: any;
}
export {};
