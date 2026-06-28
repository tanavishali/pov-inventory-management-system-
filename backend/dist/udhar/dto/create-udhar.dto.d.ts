declare class UdharProductDto {
    name: string;
    qty: number;
    price: number;
}
export declare class CreateUdharDto {
    id?: string;
    customerId: number;
    date: string;
    type: string;
    desc: string;
    products?: UdharProductDto[];
    total?: number;
    advance?: number;
    udharAmt: number;
}
export {};
