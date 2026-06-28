import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    getSettings(req: any): Promise<{
        allowedNumbers: string[];
    }>;
    updateSettings(req: any, body: {
        allowedNumbers: string[];
    }): Promise<{
        success: boolean;
        allowedNumbers: string[] | undefined;
    }>;
    disconnect(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    connect(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
