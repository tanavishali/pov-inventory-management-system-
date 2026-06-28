declare class OrderProductDto {
    name: string;
    qty: number;
    price: number;
    ctn?: number;
}
export declare class CreateOrderDto {
    customer: string;
    shop: string;
    phone?: string;
    salesman?: string;
    payment: string;
    advance?: number;
    products: OrderProductDto[];
}
export {};
