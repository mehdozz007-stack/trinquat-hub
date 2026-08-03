/**
 * Response Utilities
 */

import { AppError } from "./errors";

export function jsonResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function successResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): Response {
  return jsonResponse(
    {
      success: true,
      data,
    },
    status,
    headers
  );
}

export function errorResponse(error: AppError | Error, headers?: Record<string, string>): Response {
  if (error instanceof AppError) {
    return jsonResponse(error.toJSON(), error.statusCode, headers);
  }

  return jsonResponse(
    {
      success: false,
      error: "Internal server error",
    },
    500,
    headers
  );
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number = 1,
  limit: number = 20,
  headers?: Record<string, string>
): Response {
  const totalPages = Math.ceil(total / limit);
  return successResponse(
    {
      items,
      total,
      page,
      limit,
      totalPages,
    },
    200,
    headers
  );
}
