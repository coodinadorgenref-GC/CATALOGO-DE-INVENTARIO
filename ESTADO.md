# ESTADO — Catálogo de Inventario (Grupo Camejo)
Última revisión: 2026-10-29 · Último cambio documentado: lista general de precios (27-oct-2026) · Última versión numerada: v62 (24-oct-2026)

## Qué es
PWA de un solo archivo (`index.html`) con el catálogo de refacciones de Grupo Camejo. La usan administración, vendedores y clientes (con login). Corre en GitHub Pages y lee/escribe en Google Sheets mediante Apps Script (repo `apps-script`) y el Worker de Cloudflare `catalogo-labarata-proxy`.

## Estado actual
- Cotización de piso: hoja PDF tipo factura, vigencia (hoy + 7 días), edición, vista previa y WhatsApp. Cotizaciones solicitadas por clientes en el panel Pendientes (4 pasos: Atender · Revisar · Enviar · Cerrar).
- Secciones Vento / Carabela / Suzuki / Bajaj. Fotos, fichas y compatibilidad solo editables por el admin o por la sección de la agencia de la cuenta (v61).
- Aspecto Claro / Oscuro / Igual que el sistema; Configuración con Aspecto, Cuenta y versión, Cotizaciones.
- Precios con IVA en pesos enteros hacia arriba (v62). `LISTA_PRECIOS` es la lista única de catálogo, cotizaciones, Maps y REPORTEADOR (27-oct).
- Conectados: rol desde la columna F y app de origen de cada sesión (v62).

## Cómo está armado
`index.html` (app, Tailwind por CDN, tokens de `MASTER.md`), `sw.js` (caché fija `catalogo-bh-shell`; no se sube versión a mano), `manifest.json` e iconos. Backend en el repo `apps-script`: `Código.js`, `Cotizaciones.js`, `Inventario_base.js`, `Precios_venta.js`, `Lista_precios.js`, `Lista_vento.js`, `Secciones.js`, `Cuentas.js`, `Motos.js`, `Compat_revision.js`, `Sesion_rol.js`.

## Roles (columna F de `Usuarios_Autorizados`)
- `admin`: todo; es el único «admin real» (Maps, Talleres, REPORTEADOR completo).
- `vendedor`: permisos de admin dentro del catálogo; entra a Maps.
- `gerente`: como vendedor en el catálogo, sin Maps; en el REPORTEADOR con alcance de su agencia.
- Cualquier otro valor: cliente con carrito (no ve precios ni existencias en tránsito).

## Reglas que no se rompen
- Los permisos se calculan siempre en el servidor, nunca con lo que manda el cliente.
- Los filtros de inventario viven en el código, no en pestañas de Sheets.
- El cliente nunca ve el costo; los precios solo los ve el asesor.
- Todo precio con IVA va en pesos enteros hacia arriba (194.60 → 195), en servidor y navegador.
- Antes de entregar cambios en `index.html`, revisar la sintaxis de sus scripts (`node --check`). Cada cambio en un `.gs` indica qué buscar y qué cambiar.
- Avisos y preguntas con `avisoApp` / `confirmarApp` (sin `alert`/`confirm` del navegador). Botones verdes con `.btn-primary`; no usar `bg-emerald-600 text-white` (no pasa contraste).

## Pendientes (tomados del 18-oct; por revalidar)
- Rediseño estructural: tarjeta de producto, hojas inferiores, filtros plegables.
- Migrar los colores fijos de Tailwind a tokens, pantalla por pantalla.
- Revocar el token de GitHub que se compartió.
- Probar con datos reales: cuenta gerente, cliente con productos de dos secciones, envío parcial, PDF del cliente, aspecto claro en celular.

## Documentos
`README.md` (presentación) · `ESTADO.md` (este) · `HISTORIAL.md` (bitácora completa: decisiones 1–24 y secciones por fecha) · `MASTER.md` (sistema visual).
