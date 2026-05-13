import type {
    CdekCityApiItem,
    CdekCityOption,
    CdekOfficeApiItem,
    CdekOfficeOption,
    CdekTokenResponse,
    CdekDeliveryOption,
    CdelReciveCalcTariff,
} from "./cdek.types.js";

const DEFAULT_CDEK_API_URL = "https://api.cdek.ru/v2";

let cachedToken: {
    value: string;
    expiresAt: number;
} | null = null;

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing ${name} environment variable`);
    }

    return value;
}

function getCdekApiUrl() {
    return process.env.CDEK_API_URL ?? DEFAULT_CDEK_API_URL;
}

async function requestCdekToken() {
    const apiUrl = getCdekApiUrl();
    const clientId = getRequiredEnv("CDEK_CLIENT_ID");
    const clientSecret = getRequiredEnv("CDEK_CLIENT_SECRET");

    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
    });

    const response = await fetch(`${apiUrl}/oauth/token?parameters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`CDEK_TOKEN_ERROR: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as CdekTokenResponse;

    if (!data.access_token) {
        throw new Error("CDEK_TOKEN_EMPTY");
    }

    const expiresInMs = Math.max(data.expires_in - 60, 60) * 1000;

    cachedToken = {
        value: data.access_token,
        expiresAt: Date.now() + expiresInMs,
    };

    return cachedToken.value;
}

async function getCdekToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.value;
    }

    return requestCdekToken();
}

async function cdekGet<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
    const apiUrl = getCdekApiUrl();
    const token = await getCdekToken();

    const url = new URL(`${apiUrl}${path}`);

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            url.searchParams.set(key, String(value));
        }
    });

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`CDEK_REQUEST_ERROR: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
}

function mapCity(item: CdekCityApiItem): CdekCityOption {
    const region = item.region ?? null;
    const country = item.country ?? null;

    return {
        code: String(item.code),
        city: item.city,
        region,
        country,
        fullName: [item.city, region, country].filter(Boolean).join(", "),
    };
}

function mapOffice(item: CdekOfficeApiItem): CdekOfficeOption {
    const address = item.location?.address ?? item.address ?? "";
    const fullAddress = item.location?.address_full ?? address;

    return {
        code: item.code,
        name: item.name ?? item.code,
        address,
        fullAddress,
        workTime: item.work_time ?? null,
        phones:
            item.phones
                ?.map((phone) => phone.number)
                .filter((phone): phone is string => Boolean(phone)) ?? [],
        latitude: item.location?.latitude ?? null,
        longitude: item.location?.longitude ?? null,
    };
}

export const cdekService = {
    async searchCities(query: string) {
        const normalizedQuery = query.trim();

        const cities = await cdekGet<CdekCityApiItem[]>("/location/cities", {
            country_codes: "RU",
            city: normalizedQuery || undefined,
            size: 20,
        });

        return cities.map(mapCity);
    },

    async getOfficesByCityCode(cityCode: string) {
        const normalizedCityCode = cityCode.trim();

        if (!normalizedCityCode) {
            return [];
        }

        const offices = await cdekGet<CdekOfficeApiItem[]>("/deliverypoints", {
            country_code: "RU",
            city_code: normalizedCityCode,
            type: "PVZ",
            is_handout: true,
        });

        return offices.map(mapOffice);
    },


    async calculateDelivery(
        fromCity: string,
        toCity: string,
        weightGram: number,
        dimensions: { length: number; width: number; height: number },
        tariff: number, // тариф для расчета
        deliveryType: "ADDRESS" | "PVZ" // тип доставки
    ): Promise<CdelReciveCalcTariff> {
        const token = await getCdekToken();
        const apiUrl = getCdekApiUrl();
        const toCityNumber: number = Number(toCity);
        console.log(toCity);
        const payload = {
            "from_location":
            {
                "code": 44
            }
            ,
            "to_location":
            {
                "code": toCityNumber
            }
            ,
            "tariff_code": 136,
            "type": 1, // интернет-магазин
            "currency": 1,
            "lang": "rus",
            "packages":
            {
                "weight": 1000,
                "length": 10,
                "width": 10,
                "height": 10,
            },

        };
        console.log(payload);
        const res = await fetch(`${apiUrl}/calculator/tariff`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`CDEK_CALC_ERROR: ${res.status} ${text}`);
        }

        const data = await res.json();
        console.log(data);
        // Возвращаем минимально нужное для фронта
        // Берём первый тариф из ответа (или всё, если нужно массив)

        return {
            total_sum: data?.total_sum ?? 0,
            calendar_min: data?.calendar_min ?? null,
            calendar_max: data?.calendar_max ?? null,
        };
    }
};