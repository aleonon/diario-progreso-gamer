
import type {
  Request,
  Response,
  NextFunction
} from "express";

export const logger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const inicio = process.hrtime.bigint();

  res.on("finish", () => {
    const fin = process.hrtime.bigint();

    const duracionMs =
      Number(fin - inicio) / 1_000_000;

    const requestId =
      res.locals.requestId ?? "sin-id";

    console.log(
      `[${new Date().toISOString()}] ` +
      `[${requestId}] ` +
      `${req.method} ${req.originalUrl} ` +
      `${res.statusCode} ` +
      `${duracionMs.toFixed(2)}ms`
    );
  });

  next();
};
