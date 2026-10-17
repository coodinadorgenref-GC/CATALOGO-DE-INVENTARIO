# MASTER — Sistema visual del Catálogo de Inventario

> Fuente única de verdad del diseño. Si existe `pages/<pantalla>.md`, sus reglas **sustituyen** a este archivo para esa pantalla.
> Generado con UI/UX Pro Max (16-oct-2026) y adaptado al catálogo: es una **herramienta de trabajo** (mostrador + celular), no una landing.
> Dials: Variance 3 (minimal) · Motion 3 (sutil) · Density 6 (estándar, tirando a compacta en listas).
> Etapa 1: diseño. La capa base ya está aplicada en `index.html` (ver §14); lo estructural queda para la etapa 6.

## 1. Dirección

- **Estilo:** Minimalismo / Swiss funcional, con **tres aspectos**: Oscuro, Claro e Igual que el sistema, que se eligen en Configuración → Aspecto (decisión 1, §13). Aspecto inicial: por confirmar.
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
| Cotizar en ruta (abre Maps) | visible | — |

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

### Aspectos: Oscuro, Claro e Igual que el sistema

Los tres se eligen en Configuración → Aspecto (§7.1). Mecanismo:
- Atributo `data-theme="dark|light"` en `<html>`. "Igual que el sistema" no fija atributo y sigue `prefers-color-scheme`.
- La elección se guarda en el dispositivo (`localStorage`, clave `aspecto`) y un script mínimo en `<head>` la aplica antes de pintar, para que no haya parpadeo.
- `<meta name="color-scheme" content="dark light">`; al cambiar de aspecto se actualiza también `theme-color`.
- Todo color va por token. Las clases Tailwind de color fijo (`bg-slate-900`, `text-emerald-400`, `border-slate-700`…) no cambian con el aspecto y hay que migrarlas a tokens.

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0f172a` | `#f8fafc` |
| `--surface` | `#1e293b` | `#ffffff` |
| `--surface-2` | `#273449` | `#f1f5f9` |
| `--border` (decorativo) | `#334155` | `#cbd5e1` |
| `--border-strong` (bordes de inputs y controles, ≥ 3:1) | `#64748b` (3.1:1) | `#64748b` (4.8:1) |
| `--text` | `#f1f5f9` (16.3:1) | `#0f172a` (17.1:1) |
| `--text-2` | `#cbd5e1` (9.9:1) | `#334155` (10.4:1) |
| `--text-3` | `#94a3b8` (5.7:1) | `#475569` (7.6:1) |
| `--brand` (fondo de botón) | `#22b14c` | `#22b14c` |
| `--on-brand` | `#0f172a` (6.3:1) | `#0f172a` (6.3:1) |
| `--brand-text` (texto y enlaces verdes) | `#22b14c` (6.3:1) | `#047857` (5.5:1 sobre tarjeta, 5.2:1 sobre fondo) |
| `--attention` (fondo) | `#fb923c` | `#fb923c` |
| `--on-attention` | `#0f172a` | `#0f172a` (7.9:1) |
| `--attention-text` | `#fb923c` (6.5:1) | `#b45309` (5.0:1) |
| `--danger` | `#f87171` (5.3:1) | `#b91c1c` (6.5:1) |
| `--ring` | `#22b14c` | `#047857` (5.5:1) |

El verde de marca `#22b14c` sobre fondo claro da solo 2.5:1: sirve como fondo de botón (con `--on-brand`), nunca como color de texto en claro; para eso está `--brand-text`. Contrastes calculados el 16-oct-2026.

## 4. Tipografía

- **Títulos y precios:** Rubik 500/600/700. **Cuerpo:** Nunito Sans 400/600/700/800/900 (la app usa `font-bold` y `font-black` en muchos sitios; con solo 400/600 todo el negro se vería semibold). `display=swap`.
- **SKU / números de parte:** monoespaciada del sistema, `font-variant-numeric: tabular-nums`, para que columnas y precios alineen.
- Cuerpo mínimo **16 px** (evita zoom automático de iOS en inputs); etiquetas auxiliares ≥ 12 px. Interlineado 1.5 en texto corrido, 1.25 en tarjetas.
- Escala: 12 · 14 · 16 · 18 · 22 · 28.

## 5. Espaciado, forma y profundidad

- Espaciado (density 6): `4 · 8 · 12 · 16 · 24 · 32 · 48`. Listas y tablas de catálogo usan 8/12; paneles y modales 16/24.
- Radio: 8 px controles, 12 px tarjetas, 16 px modales/hojas inferiores.
- Profundidad en oscuro: **borde 1 px + cambio de superficie**, sombra solo en modales y menús (`0 10px 24px rgba(0,0,0,.45)`).
- Profundidad en claro: borde `--border` y sombra suave en tarjetas y menús (`0 1px 2px rgba(15,23,42,.08), 0 4px 12px rgba(15,23,42,.08)`).
- Máx. de ancho de lectura en desktop: 1280 px; el catálogo es rejilla fluida (2 col móvil · 3 tablet · 4–5 desktop).

## 6. Componentes

**Botón primario:** fondo `--brand`, texto `--on-brand`, 44 px de alto mínimo, radio 8, peso 600. Hover: aclarar 6 %. Presionado: oscurecer 6 %. Cargando: spinner + texto "Enviando…" y deshabilitado (nunca cambio instantáneo sin feedback).
**Secundario:** transparente, borde `--border`, texto `--text`; hover `--surface-2`.
**Peligro:** borde y texto `--danger`; confirmación antes de acciones destructivas.
**Solo ícono:** siempre `aria-label` y área táctil ≥ 44×44 (hoy hay muchos más chicos).

**Tarjeta de producto:** foto 1:1 con espacio reservado (sin saltos de layout) · SKU mono · descripción (2 líneas máx.) · insignia de disponibilidad · [rol vendedor] precio alineado a la derecha · botón "Agregar". Foto con `loading="lazy"` y `imagen-no-disponible.png` como respaldo.
**Insignias de disponibilidad:** `En existencia` (brand), `Pocas piezas` (attention), `Agotado` (danger), `Bajo pedido` (attention). Siempre ícono + texto.
**Inputs:** etiqueta visible arriba (nada de placeholder como etiqueta), error debajo del campo en `--danger` con ícono, ayuda en `--text-3`, `inputmode`/`autocomplete` correctos (teléfono: `tel`).
**Captura de cotización (todas):** orden fijo: 1) **ID de cliente** (si existe, se traen todos sus datos y los campos siguientes se llenan solos y siguen editables) · 2) Nombre · 3) Teléfono · 4) Motocicleta (opcional) · 5) Año (opcional) · 6) buscador de producto (SKU, nombre o número de parte; Enter agrega el primer resultado, admite lector/pegado). **No hay selector de Agencia**: la hoja sale con el logo de la agencia del asesor (§8). Hoja inferior en móvil, áreas táctiles de 44 px, disponibilidad con ícono + texto. Implementada en `index.html` (`cotPiso*`) con este orden y sin selector de Agencia (17-oct). Al guardar, **Hoja PDF** es la acción principal del panel y "Nueva cotización" pasa a secundaria.
**Modales:** en móvil se convierten en hoja inferior (`max-h 90dvh`, scroll interno, cierre con Esc y toque fuera); respetar `env(safe-area-inset-*)`.

## 7. Navegación y patrones de pantalla

- Móvil: barra inferior fija, **máx. 5 destinos**, ícono + texto, con insignia numérica accesible (carrito, pendientes). Contenido con `padding-bottom` para no quedar tapado.
- Desktop: barra superior con buscador siempre visible; atajos de teclado actuales se conservan.
- Búsqueda: protagonista de la pantalla de catálogo; filtros en panel plegable ("progressive disclosure"), no una fila interminable de selects.
- Sustituye al patrón "Feature-Rich Showcase" del generador (era para landings): aquí no hay hero ni CTA repetido.
- **Acción principal (Cotizar):** es lo más importante del vendedor y no puede parecerse a los demás botones flotantes. En móvil va como botón central elevado de la barra inferior (verde `--brand`, ícono + etiqueta "Cotizar", 56 px); en escritorio, botón primario fijo con texto. Los demás destinos son secundarios, sin el relleno de la marca.
- **Etiquetas en botones con ícono:** el texto va **debajo** del ícono, nunca dentro del círculo o disco. Unos 10 caracteres como máximo ("Pendientes" es el límite; en el botón de cotizar, "Cotizar"), 11–12 px, `white-space: nowrap` y `min-width: 0`. Si no cabe, se quita la etiqueta y queda el `aria-label`. Se prueba a 360 px de ancho.

Pantallas con override previsto en `pages/`: `login`, `catalogo`, `carrito`, `cotizar`, `pendientes`, `configuracion`, `cotizacion-pdf`.

### 7.1 Configuración (panel oculto)

Panel oculto, al estilo de Maps y del REPORTEADOR: no aparece en la navegación principal. Tres secciones:
- **Aspecto:** Claro · Oscuro · Igual que el sistema. Selector de tres opciones que aplica al instante (§3). **Pendiente:** primero hay que migrar los colores fijos de Tailwind a tokens; si no, el tema claro se vería roto.
- **Cuenta y versión:** hecho (17-oct); muestra la versión de la app (`APP_VERSION`).
- **Cotizaciones:** las mismas funciones que en Maps: historial, consulta, reenviar, cambiar estado (Borrador · Enviada · Aceptada · Rechazada · Cancelada), etc. Hecho en parte (17-oct): lista de las propias, búsqueda, ver líneas, cambiar estado y reenviar por WhatsApp sin número de parte.

Hoy el engrane de la cabecera lo ven todos los usuarios con sesión y la pestaña Cotizaciones solo los asesores. Por confirmar: si se deja así o se oculta de otra forma.

## 8. Hoja de cotización (excepción al aspecto de la app: siempre clara)

Documento **claro, tamaño carta, tipo factura**, independiente del tema de la app (se imprime/comparte). Un solo formato; el logo lo define la agencia del asesor (sin selector). **Hecho en código (17-oct)**, falta probarlo en el celular. Encabezado: logo a la izquierda (9 mm de alto) o, sin logo, "LA BARATA DEL HOGAR"; a la derecha "COTIZACIÓN" en verde oscuro `#047857`, folio y fecha; filete verde `#22b14c`. Caja gris claro con cliente (nombre, ID, teléfono) y asesor de ventas, más motocicleta y año si se capturaron. Tabla con encabezado verde oscuro y texto blanco (5.5:1), filas alternadas, columnas cant., SKU, descripción, disponibilidad, precio unitario e importe; el encabezado se repite en cada hoja. Total grande a la derecha. Notas: `*` precio aproximado, partidas sin precio como "Por confirmar" (no suman) y "Precios y existencias sujetos a confirmación." Pie: folio y "Hoja X de N". Sin números de parte de "bajo pedido" ni costos. Referencia: `generarPdfNotaVenta` (Maps). Pendiente: datos de contacto del asesor.

**Logo por agencia:** salen de `logos-marcas.js` de Maps y viven en el repo como `logo-carabela.png`, `logo-suzuki.png` y `logo-bajaj.png`. Carabela → Carabela, Suzuki → Suzuki, cualquier Bajaj → Bajaj; solo esos tres. Vento, "TODAS" o sin almacén salen sin logo.

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
- Texto dentro de un círculo o disco de ícono: se desborda; la etiqueta va debajo.
- Colores fijos de Tailwind (`bg-slate-900`, `text-emerald-400`, `border-slate-700`…) en pantallas nuevas: no cambian con el aspecto; usar tokens.
- Dejar la acción principal con el mismo peso visual que las secundarias.

## 12. Lista de verificación antes de entregar cualquier pantalla

- [ ] Probado en 375, 768, 1024 y 1440 px, sin scroll horizontal
- [ ] Contrastes revisados con los tokens de la sección 3, en aspecto claro y en oscuro
- [ ] Áreas táctiles ≥ 44×44 y separación ≥ 8 px
- [ ] Foco visible y orden de tabulación lógico
- [ ] Estados vacío, cargando y error diseñados
- [ ] Cliente: confirmado que no llega ningún precio ni número de parte en la respuesta del API
- [ ] `node --check` a los `<script>` de `index.html` (regla del README)
- [ ] `sw.js` y `README.md` actualizados si cambia algo cacheable

## 13. Decisiones tomadas (16-oct-2026)

1. **Tres aspectos** (16-oct, sustituye a "solo oscuro"): Claro, Oscuro e Igual que el sistema, elegibles en Configuración → Aspecto. Tokens para ambos en §3.
2. **Fuentes:** Rubik + Nunito Sans (Google Fonts). Hay que cachearlas en `sw.js` para uso sin conexión.
3. **Íconos:** se mantiene Font Awesome 6.4; se decide si se migra a SVG en la etapa 6.
4. **Una sola hoja de cotización**, sin selector de agencia; el logo sale de la agencia del asesor: Carabela, Suzuki o Bajaj (17-oct, ajusta la decisión del 16-oct de un logo único).
5. **Toda cotización empieza por el ID del cliente** (16-oct), §6.
6. **Logo de la hoja** (17-oct): solo Carabela, Suzuki y Bajaj, tomados de `logos-marcas.js` de Maps y guardados en el repo (§8).
7. **Para después** (17-oct, por indicación): barra inferior móvil y rediseño estructural.

## 14. Estado de aplicación en `index.html` (16-oct-2026)

**Aplicado:** tokens en `:root` (los nombres viejos `--verde`, `--fondo`, `--tarjeta`, `--borde` quedan como alias); clases `.btn-primary`, `.btn-attention`, `.btn-state-ok`, `.btn-state-error`, `.badge-brand`; texto gris `slate-500` y `#64748b` sustituido por `--text-3`; fuentes Rubik y Nunito Sans (se cachean solas en `sw.js`); foco visible con teclado; `prefers-reduced-motion` también para `animate-bounce`/`animate-pulse`; `aria-label` en 29 botones solo-ícono, `aria-hidden` en los íconos decorativos, toasts con `aria-live="polite"`, error de login con `role="alert"`; `loading="lazy"` en miniaturas, tarjetas y carrito; emojis (🏍🔵🟣🟠📦📩✓⏳) sustituidos por íconos Font Awesome.
**Piso de texto:** 11 px (10 px solo en insignias sobre miniaturas). Subir a 12 px al rediseñar tarjetas.
**Pendiente (etapa 6):** barra inferior móvil, tarjeta de producto y precio en Rubik, modales como hoja inferior, áreas táctiles ≥ 44 px, botón de contraseña con `tabindex="-1"` (no se alcanza con teclado), campos de cotización (`type="tel"`).
**Aplicado (16-oct):** botones flotantes: "Cotizar" pasa a ser el principal (72 px, a la derecha, relleno de marca) y "Pendientes" queda secundario a su izquierda (superficie con borde); las etiquetas ya no van en mayúsculas ni desbordan (11–12 px, una línea). Buscar por Foto eliminado. "Cotizar en ruta" en el pie del carrito del cliente.
**Hecho (17-oct):** captura con ID de cliente primero y sin Agencia (§6); panel Configuración con Cuenta y versión y Cotizaciones (§7.1); hoja de cotización con logo por agencia y botón Hoja PDF (§8), falta probarla en el celular.
**Sigue pendiente:** Aspecto claro/oscuro/sistema, que exige antes migrar los colores fijos de Tailwind a tokens (hoy unas 235 líneas de `index.html` usan `bg-/text-/border-slate-*` o `emerald-*`, y no hay `data-theme` ni `prefers-color-scheme`); datos de contacto del asesor en la hoja; y el rediseño estructural del index (barra inferior móvil, tarjeta de producto, hojas inferiores), que queda para después.
