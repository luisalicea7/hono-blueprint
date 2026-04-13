export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target?.name ?? "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, "BAD_REQUEST", 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, "CONFLICT", 409);
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, "INTERNAL_ERROR", 500);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable") {
    super(message, "SERVICE_UNAVAILABLE", 503);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/** JSON body for `AppError` responses */
export type ApiErrorPayload = {
  status: "error";
  code: string;
  message: string;
  timestamp: string;
};

export function appErrorToPayload(err: AppError): ApiErrorPayload {
  return {
    status: "error",
    code: err.code,
    message: err.message,
    timestamp: new Date().toISOString(),
  };
}
