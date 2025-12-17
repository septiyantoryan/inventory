// Common API response types
export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
    errors?: Array<{
        code: string;
        expected?: string;
        received?: string;
        path: (string | number)[];
        message: string;
    }>;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination
export interface PaginationParams {
    limit?: number;
    offset?: number;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationMeta;
}
