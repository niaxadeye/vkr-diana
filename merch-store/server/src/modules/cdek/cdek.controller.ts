import type { Request, Response } from "express";

import { fail, success } from "../../utils/api-response.js";
import { cdekService } from "./cdek.service.js";

export const cdekController = {
    async searchCities(req: Request, res: Response) {
        const query = String(req.query.query ?? "");

        try {
            const cities = await cdekService.searchCities(query);

            return success(res, cities);
        } catch (error) {
            console.error("CDEK_SEARCH_CITIES_ERROR:", error);

            return fail(
                res,
                500,
                "CDEK_SEARCH_CITIES_ERROR",
                "Не удалось получить список городов CDEK",
            );
        }
    },

    async getOffices(req: Request, res: Response) {
        const cityCode = String(req.query.cityCode ?? "");

        if (!cityCode.trim()) {
            return fail(
                res,
                400,
                "CDEK_CITY_CODE_REQUIRED",
                "Не передан код города CDEK",
            );
        }

        try {
            const offices = await cdekService.getOfficesByCityCode(cityCode);

            return success(res, offices);
        } catch (error) {
            console.error("CDEK_GET_OFFICES_ERROR:", error);

            return fail(
                res,
                500,
                "CDEK_GET_OFFICES_ERROR",
                "Не удалось получить список пунктов выдачи CDEK",
            );
        }
    },
    async calculateDelivery(req: Request, res: Response) {
        const {
            fromCity,
            toCity,
            weightGram,
            lengthCm,
            widthCm,
            heightCm,
            deliveryType, // "courier" | "cdek_pickup"
        } = req.body;
        if (!toCity || !weightGram || !deliveryType) {
            return fail(
                res,
                400,
                "CDEK_DELIVERY_PARAMS_MISSING",
                "Не переданы параметры доставки",
            );
        }

        // Выбираем тариф CDEK в зависимости от типа доставки
        const tariffCode = deliveryType === "courier" ? 136 : 137;

        try {
            const options = await cdekService.calculateDelivery(
                fromCity ?? "Москва",
                toCity,
                Number(weightGram),
                {
                    length: Number(lengthCm ?? 0),
                    width: Number(widthCm ?? 0),
                    height: Number(heightCm ?? 0),
                },
                tariffCode,
                deliveryType
            );

            return success(res, options);
        } catch (error) {
            console.error("CDEK_CALCULATE_ERROR:", error);
            return fail(
                res,
                500,
                "CDEK_CALCULATE_ERROR",
                "Не удалось рассчитать доставку CDEK",
            );
        }
    },
};