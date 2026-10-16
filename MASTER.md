# MASTER — Sistema visual del Catálogo de Inventario

> Fuente única de verdad del diseño. Si existe `pages/<pantalla>.md`, sus reglas **sustituyen** a este archivo para esa pantalla.
> Generado con UI/UX Pro Max (16-oct-2026) y adaptado al catálogo: es una **herramienta de trabajo** (mostrador + celular), no una landing.
> Dials: Variance 3 (minimal) · Motion 3 (sutil) · Density 6 (estándar, tirando a compacta en listas).
> Etapa 1: solo diseño. No se ha tocado `index.html`.

## 1. Dirección

- **Estilo:** Minimalismo / Swiss funcional, **oscuro por defecto** (continuidad con la app actual y con `theme-color #1d293d`).
- **Prioridad:** encontrar un SKU y cotizarlo en pocos toques. Todo lo demás es secundario.
- **Stack real:** HTML único + Tailwind v4 (CDN browser) + Font Awesome 6.4. Los tokens van como variables CSS en `:root` y se consumen con clases Tailwind (`bg-[var(--surface)]`) o utilitarios propios.
- **Sin dependencias nuevas** para animación (CSS puro; no GSAP): es PWA de un archivo y debe cargar rápido.

## 2. Quién ve qué (regla de diseño, no solo de permisos)

| Elemento | Cliente | Vendedor / Gerente / Admin |
|---|---|---|
| Precio, "sin precio" | no existe en el DOM | visible |
| Número de parte "bajo pedido" | no existe | visible solo en la UI, **nunca** en la hoja de cotización |
| Costo | nunca | nunca |
| Navegación | Catálogo · Carrito · Cuenta | + Cotizar · Pendientes |

Los precios no se ocultan con CSS: el servidor no los manda. La UI solo debe tener un hueco predecible para ellos.

## 3. Color (tokens)

Base conservada de la app actual (`#0f172a / #1e293b / #334155 / #22b14c`), con correcciones de contraste.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0f172a` | fondo de página |
| `--surface` | `#1e293b` | tarjetas, paneles, modales |
| `--surface-2` | `#273449` | hover de filas/tarjetas, inputs |
| `--border` | `#334155` | bordes (no es texto; en dark se usa borde en vez de sombra) |
| `--text` | `#f1f5f9` | texto principal (16.3:1) |
| `--text-2` | `#cbd5e1` | texto secundario (9.9:1 sobre tarjeta) |
| `--text-3` | `#94a3b8` | ayudas, etiquetas (5.7:1 sobre tarjeta) |
| `--brand` | `#22b14c` | marca, enlaces, acentos (6.3:1 sobre fondo) |
| `--brand-strong` | `#059669` | bordes activos, íconos de estado ok |
| `--on-brand` | `#0f172a` | texto sobre botón verde (6.3:1) |
| `--attention` | `#fb923c` | bajo pedido, pendiente, sin precio (6.5:1) |
| `--on-attention` | `#0f172a` | texto sobre fondo ámbar |
| `--danger` | `#f87171` | errores, agotado (5.3:1) |
| `--ring` | `#22b14c` | anillo de foco |

**Correcciones obligatorias a lo que hay hoy** (medido):
- Texto blanco sobre `#059669` = **3.77:1** (falla). Botón verde pasa a fondo `--brand` con texto `--on-brand`.
- `#64748b` como texto = **3.07:1** sobre tarjeta y 3.75 sobre fondo (falla; hay ~39 usos). Sustituir por `--text-3`.
- Ámbar/naranja = "requiere atención" (bajo pedido, cotización pendiente, kits de proveedor). **No** es el color del botón principal.
- El estado nunca va solo en color: siempre ícono + texto (ej. ● En existencia / ⚠ Bajo pedido, con ícono FA, no emoji).

**Modo claro:** no se define en esta etapa (ver decisiones abiertas). Si se pide, se invierten los tokens `--bg/--surface/--text*` y se re-verifica 4.5:1.

## 4. Tipografía

- **Títulos y precios:** Rubik 500/600. **Cuerpo:** Nunito Sans 400/600. `display=swap`.
- **SKU / números de parte:** monoespaciada del sistema, `font-variant-numeric: tabular-nums`, para que columnas y precios alineen.
- Cuerpo mínimo **16 px** (evita zoom automático de iOS en inputs); etiquetas auxiliares ≥ 12 px. Interlineado 1.5 en texto corrido, 1.25 en tarjetas.
- Escala: 12 · 14 · 16 · 18 · 22 · 28.

## 5. Espaciado, forma y profundidad

- Espaciado (density 6): `4 · 8 · 12 · 16 · 24 · 32 · 48`. Listas y tablas de catálogo usan 8/12; paneles y modales 16/24.
- Radio: 8 px controles, 12 px tarjetas, 16 px modales/hojas inferiores.
- Profundidad en oscuro: **borde 1 px + cambio de superficie**, sombra solo en modales y menús (`0 10px 24px rgba(0,0,0,.45)`).
- Máx. de ancho de lectura en desktop: 1280 px; el catálogo es rejilla fluida (2 col móvil · 3 tablet · 4–5 desktop).

## 6. Componentes

**Botón primario:** fondo `--brand`, texto `--on-brand`, 44 px de alto mínimo, radio 8, peso 600. Hover: aclarar 6 %. Presionado: oscurecer 6 %. Cargando: spinner + texto "Enviando…" y deshabilitado (nunca cambio instantáneo sin feedback).
**Secundario:** transparente, borde `--border`, texto `--text`; hover `--surface-2`.
**Peligro:** borde y texto `--danger`; confirmación antes de acciones destructivas.
**Solo ícono:** siempre `aria-label` y área táctil ≥ 44×44 (hoy hay muchos más chicos).

**Tarjeta de producto:** foto 1:1 con espacio reservado (sin saltos de layout) · SKU mono · descripción (2 líneas máx.) · insignia de disponibilidad · [rol vendedor] precio alineado a la derecha · botón "Agregar". Foto con `loading="lazy"` y `imagen-no-disponible.png` como respaldo.
**Insignias de disponibilidad:** `En existencia` (brand), `Pocas piezas` (attention), `Agotado` (danger), `Bajo pedido` (attention). Siempre ícono + texto.
**Inputs:** etiqueta visible arriba (nada de placeholder como etiqueta), error debajo del campo en `--danger` con ícono, ayuda en `--text-3`, `inputmode`/`autocomplete` correctos (teléfono: `tel`).
**Captura de cotización (piso de venta):** 3 campos en este orden — Nombre · Teléfono · SKU — igual que "Nueva venta" de Maps; el SKU admite lector/pegado y valida contra el catálogo al salir del campo.
**Modales:** en móvil se convierten en hoja inferior (`max-h 90dvh`, scroll interno, cierre con Esc y toque fuera); respetar `env(safe-area-inset-*)`.

## 7. Navegación y patrones de pantalla

- Móvil: barra inferior fija, **máx. 5 destinos**, ícono + texto, con insignia numérica accesible (carrito, pendientes). Contenido con `padding-bottom` para no quedar tapado.
- Desktop: barra superior con buscador siempre visible; atajos de teclado actuales se conservan.
- Búsqueda: protagonista de la pantalla de catálogo; filtros en panel plegable ("progressive disclosure"), no una fila interminable de selects.
- Sustituye al patrón "Feature-Rich Showcase" del generador (era para landings): aquí no hay hero ni CTA repetido.

Pantallas con override previsto en `pages/`: `login`, `catalogo`, `carrito`, `cotizar`, `pendientes`, `cotizacion-pdf`.

## 8. Hoja de cotización (excepción a la regla oscura)

Documento **claro, tamaño carta, tipo factura**, independiente del tema de la app (se imprime/comparte). Mismo formato para todas las agencias; cambia solo el bloque de logos (Vento, Bajaj, Suzuki). Contenido: fecha de elaboración, ID/folio, cliente y teléfono, tabla (cant., SKU, disponibilidad, descripción, precio unitario, importe), asesor de ventas y datos de contacto. No incluye números de parte de "bajo pedido" ni costos. Se detalla en la etapa 5, tomando como referencia `generarPdfNotaVenta` (Maps).

## 9. Movimiento

- Solo `transform` y `opacity`; 150–250 ms, `ease-out` al entrar y `ease-in` al salir; salida más corta que entrada.
- Aparición de tarjetas: fundido + 8 px, sin escalonado largo. Sin animar `width/height/top/left`.
- Respetar `prefers-reduced-motion: reduce` (sin desplazamientos, solo cambio de opacidad).

## 10. Accesibilidad mínima

Contraste 4.5:1 (texto) y 3:1 (bordes de controles/íconos); foco visible siempre (`outline 2px var(--ring)`, offset 2); navegable con teclado; `aria-live="polite"` para "agregado al carrito" y errores de sesión; íconos decorativos con `aria-hidden="true"`.

## 11. Antipatrones (no usar)

- Emojis como íconos; mezclar conjuntos de íconos.
- Texto gris `#64748b` o menor sobre superficies oscuras.
- Estado solo por color; precios o números de parte renderizados "ocultos" para el cliente.
- Efectos de hover que muevan el layout; hover como única forma de acceder a algo (el mostrador es táctil).
- Cambios de estado instantáneos sin transición ni feedback de carga.
- Tablas que obliguen a scroll horizontal en 375 px (pasar a tarjetas/filas apiladas).

## 12. Lista de verificación antes de entregar cualquier pantalla

- [ ] Probado en 375, 768, 1024 y 1440 px, sin scroll horizontal
- [ ] Contrastes revisados con los tokens de la sección 3
- [ ] Áreas táctiles ≥ 44×44 y separación ≥ 8 px
- [ ] Foco visible y orden de tabulación lógico
- [ ] Estados vacío, cargando y error diseñados
- [ ] Cliente: confirmado que no llega ningún precio ni número de parte en la respuesta del API
- [ ] `node --check` a los `<script>` de `index.html` (regla del README)
- [ ] `sw.js` y `README.md` actualizados si cambia algo cacheable

## 13. Decisiones tomadas (16-oct-2026)

1. **Solo modo oscuro** por ahora. El modo claro queda fuera de alcance (excepto la hoja de cotización, sección 8).
2. **Fuentes:** Rubik + Nunito Sans (Google Fonts). Hay que cachearlas en `sw.js` para uso sin conexión.
3. **Íconos:** se mantiene Font Awesome 6.4; se decide si se migra a SVG en la etapa 6.
