export class EmailAliasError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "EmailAliasError";
    this.status = status;
  }
}

export class AuthenticationError extends EmailAliasError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends EmailAliasError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends EmailAliasError {
  constructor(message: string) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}
