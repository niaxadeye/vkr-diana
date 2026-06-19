# DESIGN.md — Frontend & Visual Design Guide

Reference: **shop.teamspirit.gg** (Team Spirit esports merch store).
Purpose: a verstka/design rulebook for building a merch storefront in the same visual language.

> Accuracy note: page **structure, routes, content patterns** are from the live site. Exact hex colors, fonts, and pixel sizes are **inferred** from Team Spirit's crimson/black/white brand and common e-commerce conventions. Tune tokens against real screenshots.

---

## 1. Brand Mood

Bold, minimal, high-contrast esports/streetwear. White space, large uppercase type, monochrome base with one crimson accent. Imagery leads; UI stays quiet. "Premium drop", not "busy marketplace."

Keywords: **monochrome, uppercase, sharp, roomy, image-led.**

---

## 2. Design Tokens

### Colors (inferred)
```
--color-bg          #FFFFFF   page background
--color-surface     #FAFAFA   cards, subtle sections
--color-surface-2   #F0F0F0   chips, icon buttons, image placeholders
--color-ink         #060606   primary text / near-black
--color-ink-muted   #666666   secondary text, old price
--color-line        #E5E5E5   borders, dividers
--color-accent      #C8102E   Team Spirit crimson — CTA, sale, active
--color-accent-dark #A00C24   accent hover
```
Rule: black-on-white by default. Crimson is an accent only (sale badges, key CTA, active states). Most buttons are near-black `#060606`, not crimson.

### Typography (inferred)
- One clean grotesque sans (Inter / Helvetica-like), multiple weights.
- Product/collection names: UPPERCASE, `tracking-[-0.04em]` on large sizes.
```
Display / hero    36–56px  medium(500)  tracking-[-0.04em]
Section heading   24–36px  medium(500)
Card title        14–15px  normal(400)  uppercase
Body              15–16px  normal(400)
Caption / muted   13–14px  normal(400)  #666666
Price             14–15px  semibold(600) on sale, else 400
```

### Spacing & radius
```
Section padding  px-4 md:px-8   vertical py-10 md:py-12
Grid gap         16–20px
Radius small     12–16px (chips, inputs)
Radius panel     16–28px ;  product image 0px
Radius pill      9999px  (buttons, badges)
Icon button      40×40 rounded-full bg-#f0f0f0
Max width        ~1256px centered
```

---

## 3. Layout Skeleton

```
HEADER   logo · nav · account · cart(count)     sticky, white, border-b
HERO     full-width banner image + H1 + 1 CTA
COLLECTIONS  title + grid of image tiles
"FOR YOU"    title + product card grid
FOOTER   © · info links · address
```

---

## 4. Core Components

### 4.1 Header
Logo → `/`. Nav: Home, All products, Lookbook, Contact, Team(external). Right: account/login + cart icon with **count badge**. Sticky `bg-white/90 backdrop-blur border-b`. Mobile: hamburger; cart + account stay.

### 4.2 Hero
Full-bleed `.webp`, taller on desktop. Overlaid large uppercase H1 + **one** pill CTA. Single message, single action.

### 4.3 Collection tile
Image (4:5 / 1:1) → link `/collections/:slug`. Uppercase label overlaid or below. Grid 2 → 3–4 cols.

### 4.4 Product card (most repeated)
```
[ image 3:4, bg #f0f0f0 ]   ← status badge top-right
TITLE IN UPPERCASE          ← 14px / 400
[price pill]  old-price     ← sale: dark/crimson pill + struck grey
```
- `aspect-[3/4]`, `object-cover`, hover zoom `group-hover:scale-[1.035] duration-700`.
- One badge, priority: sold-out > sale > new. Pill, light bg, dark text.
- Sale: current price in solid pill (`bg-#060606 text-white`), old price `line-through text-#666666`.
- Price format `1 234₽` (ru-RU). **Never break ₽ off the number**: each price `whitespace-nowrap`, container `flex-wrap` so the OLD price wraps, not the symbol.
- Whole card = one link to `/products/:id`.

### 4.5 Buttons (all pill)
```
Primary    h-12 rounded-full bg-#060606 text-white hover:bg-neutral-800
Accent     same shape, crimson — key conversion only
Secondary  bg-white text-ink ring-1 ring-line hover:bg-neutral-100
Icon       40×40 rounded-full bg-#f0f0f0 hover:bg-#060606 hover:text-white
Disabled   opacity-60 cursor-not-allowed
```

### 4.6 Badges
Pill `px-2 py-0.5 text-[14px] font-[600]`, light bg + dark text + soft shadow.

### 4.7 Footer
`© {year} Team Spirit` · info links → `/information?tab=payment|delivery|return|security|privacy|terms` · address. Single column mobile, spread row desktop.

### 4.8 Info pages
Tabbed via query param `/information?tab=...`. One layout, content switched by tab.

---

## 5. Repeating Patterns (the DNA)

1. Image tile + uppercase label + link — collections AND products.
2. Uppercase naming everywhere.
3. Single accent color (crimson) — sale/CTA/active only.
4. Pill everything — buttons, badges, price tags.
5. One CTA per surface.
6. Status badge top-right of every product image.
7. Sale = pill price + struck old price.
8. Whitespace + thin `#E5E5E5` dividers over heavy boxes.
9. Query-param tabs for secondary content.
10. Cart count badge = the only "live" header element.

---

## 6. Responsive

- Breakpoint `md` = 768px, mobile-first.
- Product grid `grid-cols-2 → md:grid-cols-3 → xl:grid-cols-4`.
- Padding `px-4 → md:px-8`, vertical `py-10 → md:py-12`.
- Nav → hamburger under `md`; modals → bottom sheets (slide-up) under `md`.
- Test 375px (iPhone SE): old price wraps, ₽ never wraps.

---

## 7. Motion

- Subtle, fast: 200–260ms, ease `cubic-bezier(0.4,0,0.2,1)`.
- Card image hover zoom ~700ms.
- Modal: desktop fade+scale (0.96→1); mobile slide-up from bottom.
- No bouncy/long animations — brand reads sharp and precise.

---

## 8. Do / Don't

Do: monochrome + one crimson accent · uppercase names/headings · give images room · one action per surface.
Don't: multiple accent colors · let ₽ wrap · multiple badges/CTAs per card · heavy boxes where whitespace + divider works.

---

## 9. Token Cheat-Sheet (Tailwind-ish)

```
text-ink     text-[#060606]
text-muted   text-[#666666]
bg-surface   bg-[#fafafa]
bg-chip      bg-[#f0f0f0]
border-line  border-[#e5e5e5]
accent       #C8102E
card-title   text-[14px] font-[400] uppercase leading-5 text-[#060606]
price-pill   rounded-full bg-[#060606] px-2 py-0.5 text-[14px] font-[600] text-white
old-price    text-[14px] text-[#666666] line-through whitespace-nowrap
btn-primary  h-12 rounded-full bg-[#060606] text-white hover:bg-neutral-800
icon-btn     h-10 w-10 rounded-full bg-[#f0f0f0] hover:bg-[#060606] hover:text-white
```
