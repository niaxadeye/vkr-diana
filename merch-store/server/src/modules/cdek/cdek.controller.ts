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
};