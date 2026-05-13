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

export type CdekTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  jti?: string;
};

export type CdekCityApiItem = {
  code: number;
  city: string;
  region?: string;
  region_code?: number;
  country?: string;
  country_code?: string;
};

export type CdekOfficeApiItem = {
  code: string;
  name?: string;
  address?: string;
  location?: {
    address?: string;
    address_full?: string;
    city?: string;
    city_code?: number;
    latitude?: number;
    longitude?: number;
  };
  work_time?: string;
  phones?: Array<{
    number?: string;
  }>;
};

export type CdekDeliveryOption = {
    type: "ADDRESS" | "PVZ"; // Тип доставки
    name: string;            // Название тарифа или ПВЗ
    price: number;           // Цена доставки в рублях
    termMin: number | null;  // Минимальный срок доставки в днях
    termMax: number | null;  // Максимальный срок доставки в днях
    address?: string;        // Полный адрес, если PVZ
    code?: string;           // Код PVZ или тарифа
};

export type CdelReciveCalcTariff = {
    total_sum: number;
    calendar_min: number;
    calendar_max: number;
}

export type CdekPackage = {
  weight: number;
  length: number;
  width: number;
  height: number;
};