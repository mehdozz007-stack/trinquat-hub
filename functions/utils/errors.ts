/**
 * Error Handling Utilities
 */

import { ApiError, ErrorCode } from "../types/common";

// Re-export ErrorCode for convenience
export { ErrorCode } from "../types/common";

export class AppError extends Error implements ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 400,
    details?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export const createError = (
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>
): AppError => {
  return new AppError(code, message, statusCode, details);
};

export const UnauthorizedError = (message = "Unauthorized") =>
  createError(ErrorCode.UNAUTHORIZED, message, 401);

export const ForbiddenError = (message = "Forbidden") =>
  createError(ErrorCode.FORBIDDEN, message, 403);

export const NotFoundError = (message = "Not found") =>
  createError(ErrorCode.NOT_FOUND, message, 404);

export const ValidationError = (message: string, details?: Record<string, any>) =>
  createError(ErrorCode.VALIDATION_ERROR, message, 400, details);

export const DatabaseError = (message = "Database error") =>
  createError(ErrorCode.DATABASE_ERROR, message, 500);

export const UploadError = (message = "Upload failed") =>
  createError(ErrorCode.UPLOAD_ERROR, message, 400);

export const ConflictError = (message = "Resource already exists") =>
  createError(ErrorCode.CONFLICT, message, 409);

export const InternalError = (message = "Internal server error") =>
  createError(ErrorCode.INTERNAL_ERROR, message, 500);
