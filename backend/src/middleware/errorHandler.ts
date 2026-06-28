import type { NextFunction, Request, Response } from "express";

import { isAppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next({
    statusCode: 404,
    code: "not_found",
    message: `Route not found: ${req.method} ${req.path}`,
  });
}

export function errorHandler(error: unknown, _req: Request, res: Response<ErrorResponse>, _next: NextFunction): void {
  const statusCode = isAppError(error) ? error.statusCode : getStatusCode(error);
  const code = isAppError(error) ? error.code : getErrorCode(error);
  const message = isAppError(error) ? error.message : getErrorMessage(error);
  const details = isAppError(error) ? error.details : undefined;

  logger.error("request.failed", {
    code,
    statusCode,
    message,
    details,
  });

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

function getStatusCode(error: unknown): number {
  if (typeof error === "object" && error !== null && "statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  return 500;
}

function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
    return error.code;
  }

  return "internal_error";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server error.";
}
