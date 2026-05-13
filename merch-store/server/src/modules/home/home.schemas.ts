import { z } from "zod";

export const updateHomeHeroSchema = z.object({
  title: z.string().min(1, "Введите заголовок").max(120).optional(),

  imageDesktop: z.string().min(1).optional(),
  imageMobile: z.string().min(1).optional(),

  videoDesktop: z.string().optional().nullable(),
  videoMobile: z.string().optional().nullable(),

  ctaLabel: z.string().min(1, "Введите текст кнопки").max(60).optional(),
  ctaHref: z.string().min(1, "Введите ссылку кнопки").max(300).optional(),

  isActive: z.boolean().optional(),
});