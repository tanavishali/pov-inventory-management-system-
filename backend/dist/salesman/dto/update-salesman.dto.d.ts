import { CreateSalesmanDto } from './create-salesman.dto';
declare const UpdateSalesmanDto_base: import("@nestjs/common").Type<Partial<CreateSalesmanDto>>;
export declare class UpdateSalesmanDto extends UpdateSalesmanDto_base {
    _id?: string;
    id?: string;
    shopId?: string;
    role?: string;
    sales?: number;
    orders?: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}
export {};
