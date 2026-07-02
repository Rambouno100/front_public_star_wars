# Armalo — Style Guide

Lenguaje visual: editorial limpio (Apple/login-style) + toques gamer mínimos (Razer-style).
Dark mode siempre. Hairlines en lugar de bordes pesados. Tipografía liviana con bold accent.

**Brand:** logo = gota verde (`ACCENT`) + wordmark "Armalo" en `fDisplay weight 600`. Mismo en NavBar y Footer.
**Body font del bar y nav:** `Inter` (no mono caps). Mono caps queda para micro-labels.
**Icono carrito:** shopping bag (no cart con ruedas).

---

## Paleta

| Token              | Valor                       | Uso                                       |
|--------------------|-----------------------------|-------------------------------------------|
| `INK`              | `#0A0A0B`                   | Background base                           |
| `PANEL`            | `#0F0F12`                   | Cards / paneles                           |
| `CARBON`           | `#15151B`                   | Strip / footer bg secundario              |
| `HAIRLINE`         | `rgba(245,245,240,0.07)`    | Bordes, divisores, separadores            |
| `HAIRLINE_STRONG`  | `rgba(245,245,240,0.14)`    | Hover/active de bordes                    |
| `CREAM`            | `#F5F5F0`                   | Texto primario, botón primary             |
| `MUTED`            | `rgba(245,245,240,0.55)`    | Texto secundario                          |
| `FAINT`            | `rgba(245,245,240,0.32)`    | Micro-labels, placeholders                |
| `ACCENT`           | `#A3FF7C`                   | **Único acento gamer** — uso mínimo       |
| `ACCENT_DIM`       | `rgba(163,255,124,0.7)`     | Acento atenuado (texto sobre fondo)       |
| `RED`              | `#FF4D4D`                   | Flash Offer + descuento % + estado cancel |
| `RED_DIM`          | `rgba(255,77,77,0.85)`      | Texto Flash Offer                         |
| `STAR`             | `#FFB547`                   | Estrellas de rating (solo cards)          |

**Regla del acento:** `ACCENT` solo en hover, focus de input, contador activo, dot del logo, underline animado de card. Nunca como background grande.

**Regla del rojo:** `RED` solo para Flash Offer badge en productos `approved === 'Price/Quality'`. Nada más.

---

## Tipografía

| Token      | Familia                                           | Uso                                       |
|------------|---------------------------------------------------|-------------------------------------------|
| `fDisplay` | `'Space Grotesk', system-ui, sans-serif`          | Headlines, precios, nombres de producto   |
| `fMono`    | `'Space Mono', ui-monospace, Menlo, monospace`    | Micro-labels, nav, botones, counters      |
| `fBody`    | `'Inter', system-ui, sans-serif`                  | Párrafos, copy general                    |

### Patrón de headline (login-style)

Peso `300` light + `<strong>` peso `600` en el acento. **Siempre.**

```jsx
<h1 style={{ fontFamily: fDisplay, fontWeight: 300, letterSpacing: '-0.035em' }}>
  Laptops premium. <strong style={{ fontWeight: 600 }}>Garantía real.</strong>
</h1>
```

Tamaños:
- Hero: `clamp(40px, 7vw, 88px)`
- Section: `clamp(36px, 5.5vw, 64px)`
- Card title: `17px / weight 400 / letter-spacing -0.015em`

### Micro-labels (eyebrows, contadores)

```jsx
<span style={{
  fontFamily: fMono, fontSize: 10, fontWeight: 400,
  letterSpacing: '0.22em', textTransform: 'uppercase',
  color: FAINT,
}}>
  Catálogo · 24 laptops
</span>
```

Casi siempre van precedidos de un hairline rule de 28px:

```jsx
<div style={{ width: 28, height: 1, background: ACCENT_DIM }} />
```

### Pesos permitidos

300 (light hero), 400 (body), 500 (mono caps), 600 (bold accent en `<strong>`), 700 (solo cart count badge).

---

## Botones

Tres variantes únicas. **Sin border-radius** (Razer-style: cantos rectos).

### Primary

`background: CREAM` → hover `ACCENT`. Texto `INK`.

```jsx
<button style={{
  fontFamily: fMono, fontSize: 11, fontWeight: 500,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  padding: '14px 28px',
  background: CREAM, color: INK,
  border: '1px solid CREAM',
}}>
  Cotizar
</button>
```

### Secondary (stroke)

Transparente + hairline. Hover sube el contraste del borde y el texto.

```jsx
<button style={{
  background: 'transparent', color: MUTED,
  border: `1px solid ${HAIRLINE}`,
  padding: '14px 28px',
  // mismas reglas mono caps
}}>
  Ver catálogo
</button>
```

### Ghost (nav)

Sin borde, solo texto mono caps. Hover sube de `MUTED` → `CREAM`.

---

## Inputs (login-style)

Sin caja. Solo underline hairline. Focus → acento.

```jsx
<input style={{
  background: 'transparent', border: 'none',
  borderBottom: `1px solid ${HAIRLINE_STRONG}`,
  padding: '10px 0', fontFamily: fBody, fontSize: 14,
  color: CREAM, outline: 'none',
}}
  onFocus={e => e.target.style.borderBottomColor = ACCENT}
  onBlur={e => e.target.style.borderBottomColor = HAIRLINE_STRONG}
/>
```

Label encima en `fMono / fontSize: 10 / letterSpacing: 0.16em / uppercase / color: FAINT`.

---

## Cards (catálogo) — estilo Amazon adaptado

- `background: PANEL`, `border: 1px solid HAIRLINE` → hover `HAIRLINE_STRONG`
- `transform: translateY(-3px)` en hover
- **Imagen: fondo blanco (#FFFFFF)** como Amazon. Max 85% width/height, centrada, scale `1.05` en hover
- **Sin overlays sobre la imagen.** Toda la info va abajo, alineada en filas con altura fija para grid perfecto.
- Padding info: `16px 16px 18px`
- Cada sección con `minHeight` fijo (brand 14px, title 39px=2 líneas, tag 22px, PVPR 16px) — esto garantiza que todas las cards alineen verticalmente aunque tengan menos info
- CTA "Ver detalle" pegada al fondo con `marginTop: auto` y `borderTop: HAIRLINE`
- **Sin rating con estrellas** — solo si futuro feedback lo justifica
- Grid: `repeat(auto-fill, minmax(240px, 1fr))` desktop / `160px` mobile, gap `clamp(14px, 1.8vw, 24px)`

### Orden de info dentro de la card (Amazon-style)

1. Brand label (mono caps, opacidad 0.7)
2. Título — **Inter weight 500, 14px, line-height 1.4** (NO Space Grotesk para títulos de card; reserva display para precio/headlines)
3. Rating (estrellas + score + count) si existe `product.score`
4. Tag inline (Oferta Relámpago / Mejor Precio / Mejor Calidad)
5. Descuento `-X%` (RED weight 600) + precio actual grande
6. PVPR tachado debajo (Inter 11px FAINT)
7. Specs en una línea (Inter 12px MUTED, max 2 líneas)
8. Línea de delivery: `Entrega GRATIS en Lima · 24-48h`

### Tags inline (NO overlays)

Tres variantes, pequeños, debajo del rating:

```jsx
// flash (Price/Quality) — relleno rojo sólido
{ bg: RED, text: '#fff', border: 'none' }
// cool (Price/Quality alternativos) — soft fill acento
{ bg: 'rgba(163,255,124,0.14)', text: ACCENT, border: 'rgba(163,255,124,0.3)' }
// neutral — soft fill cream
{ bg: 'rgba(245,245,240,0.06)', text: MUTED, border: HAIRLINE_STRONG }
```

```jsx
<span style={{
  padding: '3px 8px', fontFamily: fBody, fontSize: 10, fontWeight: 600,
  letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.4,
  background: bg, color: text, border: border,
}}>
  {label}
</span>
```

Mapping:
- `approved === 'Price/Quality'` → `'Oferta Relámpago'` flash
- `approved === 'Price'`         → `'Mejor Precio'` cool
- `approved === 'Quality'`       → `'Mejor Calidad'` cool

### Rating (estrellas estilo Amazon)

`STAR #FFB547` para llenas, `rgba(245,245,240,0.18)` para vacías. Soporta medias con `<linearGradient>`.
Acepta `score` 0-5 o 0-100 (se normaliza). Si hay `review_count` se muestra `(8,891)` en FAINT.

### Precio (Amazon-style)

```jsx
{discount > 0 && (
  <span style={{ fontFamily: fBody, fontSize: 15, fontWeight: 600, color: RED }}>
    -{discount}%
  </span>
)}
<span style={{ fontFamily: fBody, fontSize: 12, color: MUTED, fontWeight: 500 }}>S/</span>
<span style={{ fontFamily: fDisplay, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em' }}>
  {price.toLocaleString('es-PE')}
</span>
```

PVPR debajo: `PVPR: <s>S/3,499</s>` en Inter 11px FAINT.

---

## NavBar

- Altura `60px`, fixed, `backdrop-filter: blur(20px)`
- Background `rgba(10,10,11,0.65)` → `rgba(10,10,11,0.9)` al scroll
- **Logo:** SVG gota verde (`ACCENT`) + wordmark "Armalo" `fDisplay 600 / 17px`
- **Links:** `Inter 14px / weight 500` (no mono caps). Hairline `ACCENT` underline 2px cuando activo, con `scaleX` animation
- **Cart icon:** shopping bag SVG (no cart con ruedas). Stroke 1.6, `currentColor`
- **Cart badge:** redondo (`borderRadius: 9`), `ACCENT` bg, `INK` text, `Inter 10px 700`, con border-color del nav para "punch out"
- Botones auth: Inter 13px weight 500 (secundario) o 600 (primary cream)
- Mobile breakpoint: `< 820px` → hamburger

## Patterns de UX (pago, carrito)

**Step indicator** (carrito): círculos numerados 22px, conectores hairline 1px → `ACCENT` cuando done. Estado: pending=número FAINT con border HAIRLINE_STRONG, active=número ACCENT, done=checkmark INK sobre ACCENT.

**Sticky action bar:** siempre visible en cart/pedidos cuando hay acción pendiente.
- `position: fixed; bottom: 0`, full-width
- `background: rgba(10,10,11,0.96) + backdrop-blur(20px)`
- Border-top `HAIRLINE_STRONG`
- Padding `16px 20px`
- Botón principal `ACCENT` cuando habilitado, opacidad reducida cuando disabled, **con texto explícito del próximo paso** ("Selecciona dirección" / "Pagar ahora" / "Confirmar orden")
- Mobile: botón con `flex: 1` para ocupar todo el ancho disponible

**Payment modal con resumen:**
- Layout `1fr 1fr` desktop, `1fr` stacked en mobile/tablet
- Lado izquierdo (`CARBON` bg): resumen — lista de ítems, qty, subtotal, total grande en `ACCENT`, trust note con lock icon
- Lado derecho (`PANEL` bg): formulario de tarjeta (Krypton requiere fondo blanco para legibilidad, único lugar permitido)
- Full screen en mobile (no padding del modal)

---

## Hairlines y grids

- Toda separación entre secciones: `border-top/bottom: 1px solid HAIRLINE`
- Divisores dentro de cards: `height: 1; background: HAIRLINE`
- Grid de cards: `repeat(auto-fill, minmax(280px, 1fr))`, gap `clamp(20px, 2vw, 28px)`
- Sidebar de filtros: `minmax(180px, 220px)` con gap `clamp(40px, 5vw, 72px)`
- Padding de sección: `clamp(48px,7vw,88px) clamp(24px,6vw,80px)`

---

## Spacing tokens (aprox)

| Uso                          | Valor              |
|------------------------------|--------------------|
| Gap entre items en flex      | 8 / 10 / 12 / 14   |
| Gap entre secciones internas | 24 / 28 / 32 / 36  |
| Padding card                 | 22-24              |
| Padding sección              | clamp responsivo   |
| Eyebrow rule width           | 28                 |
| Hairline width               | 1                  |

---

## Animaciones

Todo en `0.2s` (UI), `0.25s` (color/border), `0.3s-0.5s` (transform/scale). Easing: default `ease`. **No usar bouncy easings.**

Una sola animación gamer permitida: el underline `width 0% → 100%` en hover de card.

---

## Qué NO hacer

- ❌ Border-radius (excepto dots de badge y `borderRadius: 50%`)
- ❌ Box-shadows decorativas (solo glow del dot rojo de Flash Offer)
- ❌ Gradientes pesados (un solo radial sutil al 0.04 opacity en hero está OK)
- ❌ Más de un color de acento por pantalla (`ACCENT` o `RED`, no ambos en la misma card excepto el badge)
- ❌ Pills de specs (usar una línea mono con `·` separadores)
- ❌ Pesos mixtos en una misma palabra
- ❌ Texto `font-weight: 700` salvo cart count
- ❌ Botones con corners redondeados
