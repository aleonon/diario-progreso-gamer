
import { randomUUID } from "node:crypto";
import type {
  Request,
  Response,
  NextFunction
} from "express";

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = randomUUID();

  res.locals.requestId = id;

  res.setHeader("X-Request-ID", id);

  next();
};
