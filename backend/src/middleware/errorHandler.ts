import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "Internal Server Error";

  res.status(500).json({
    error: message,
  });
};
