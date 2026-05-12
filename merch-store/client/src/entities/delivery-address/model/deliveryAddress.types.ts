export type DeliveryType = "courier" | "cdek_pickup";

export type DeliveryAddress = {
  id: string;
  userId: string;

  title: string;
  fullName: string;
  phone: string;

  city: string;
  deliveryType: DeliveryType;

  cdekCityCode: string | null;
  cdekCityName: string | null;
  cdekRegion: string | null;
  cdekCountry: string | null;

  cdekPvzCode: string | null;
  cdekPvzName: string | null;
  cdekPvzAddress: string | null;
  cdekPvzWorkTime: string | null;

  street: string | null;
  house: string | null;
  apartment: string | null;
  entrance: string | null;
  floor: string | null;
  courierComment: string | null;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
};

export type DeliveryAddressFormValues = {
  title: string;
  fullName: string;
  phone: string;

  city: string;
  deliveryType: DeliveryType;

  cdekCityCode: string;
  cdekCityName: string;
  cdekRegion: string;
  cdekCountry: string;

  cdekPvzCode: string;
  cdekPvzName: string;
  cdekPvzAddress: string;
  cdekPvzWorkTime: string;

  street: string;
  house: string;
  apartment: string;
  entrance: string;
  floor: string;
  courierComment: string;

  isDefault: boolean;
};

export type CreateDeliveryAddressPayload = DeliveryAddressFormValues;

export type UpdateDeliveryAddressPayload = Partial<DeliveryAddressFormValues>;