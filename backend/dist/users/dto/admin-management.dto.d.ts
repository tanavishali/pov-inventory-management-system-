export declare class CreateAdminDto {
    name: string;
    email: string;
    password: string;
    plan: string;
    monthlyFee: number;
    status: string;
    expiryDate?: string;
}
export declare class UpdateAdminDto {
    name?: string;
    email?: string;
    plan?: string;
    monthlyFee?: number;
    status?: string;
    feeStatus?: string;
    expiryDate?: string;
}
export declare class RenewAdminDto {
    days?: number;
}
