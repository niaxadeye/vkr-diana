import { apiClient } from "@/shared/api/apiClient";

export type CdekCityOption = {
    code: string;
    city: string;
    region: string | null;
    country: string | null;
    fullName: string;
};

export type CdekOfficeOption = {
    code: string;
    name: string;
    address: string;
    fullAddress: string;
    workTime: string | null;
    phones: string[];
    latitude: number | null;
    longitude: number | null;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    meta?: unknown;
    error?: {
        code: string;
        message: string;
        details?: unknown[];
    };
};

export async function searchCdekCities(query = "") {
    const normalizedQuery = query.trim();

    const response = await apiClient.get<ApiResponse<CdekCityOption[]>>(
        "/cdek/cities",
        {
            params: normalizedQuery
                ? {
                    query: normalizedQuery,
                }
                : undefined,
        },
    );

    return response.data.data;
}

export async function getCdekOffices(cityCode: string) {
    const normalizedCityCode = cityCode.trim();

    if (!normalizedCityCode) {
        return [];
    }

    const response = await apiClient.get<ApiResponse<CdekOfficeOption[]>>(
        "/cdek/offices",
        {
            params: {
                cityCode: normalizedCityCode,
            },
        },
    );

    return response.data.data;
}