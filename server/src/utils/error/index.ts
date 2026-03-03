import { Prisma } from "@prisma/client";
import { Response } from "express";
import { ZodError } from "zod";
import { ResponseUtil } from "../response";

export const handleError = (error: any, res: Response) => {
    if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
        return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Validation failed" },
            errors,
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return ResponseUtil.error(
                    res,
                    `Unique constraint failed on ${error.meta?.target}`,
                    409,
                    "DUPLICATE_ENTRY",
                );
            case "P2025":
                return ResponseUtil.error(res, "Record not found", 404, "NOT_FOUND");
            case "P2003":
                return ResponseUtil.error(
                    res,
                    "Foreign key constraint failed",
                    400,
                    "FOREIGN_KEY_ERROR",
                );
            case "P2014":
                return ResponseUtil.error(
                    res,
                    "Invalid relation",
                    400,
                    "INVALID_RELATION",
                );
            default:
                return ResponseUtil.error(
                    res,
                    "Database operation failed",
                    500,
                    "DATABASE_ERROR",
                );
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return ResponseUtil.error(
            res,
            "Invalid data provided",
            400,
            "VALIDATION_ERROR",
        );
    }

    if (error.statusCode) {
        return ResponseUtil.error(
            res,
            error.message,
            error.statusCode,
            error.code || "APPLICATION_ERROR",
        );
    }

    return ResponseUtil.error(
        res,
        error.message || "Internal server error",
        500,
        "INTERNAL_ERROR",
    );
};
