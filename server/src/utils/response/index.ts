import { Response } from "express";

export class ResponseUtil {
    static success(res: Response, data: any, message?: string, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static error(res: Response, message: string, statusCode = 400, code?: string) {
        return res.status(statusCode).json({
            success: false,
            error: {
                code,
                message,
            },
        });
    }
}
