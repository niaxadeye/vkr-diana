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