# ESTADO — Catálogo de Inventario (Grupo Camejo)

## Qué es
PWA de un solo archivo con el catálogo de refacciones de Grupo Camejo. La usan administración, vendedores y clientes (con login). Corre en GitHub Pages y lee/escribe en Google Sheets mediante Apps Script.

## Cómo está armado
- `index.html`: toda la app (login, catálogo, carrito del cliente, panel de Cotizaciones Pendientes, galería de fotos). Estilos con Tailwind (CDN) y los tokens de `MASTER.md` en `:root` (`--brand`, `--surface`, `--text-3`…). Botones verdes con `.btn-primary`, ámbar con `.btn-attention`, insignias con `.badge-brand`; no volver a usar `bg-emerald-600 text-white` (no pasa contraste).
- `MASTER.md`: sistema visual del rediseño (fuente única de verdad del diseño).
- **Cotizar en piso de venta** (`index.html`, bloque `js-cotizar-piso`, prefijo `cotPiso*`/`_cp*`): botón flotante "Cotizar" solo para `esAdmin` (admin, vendedor, gerente). Hoy captura nombre, teléfono, motocicleta y año, ID de cliente, agencia (logos de la hoja) y productos por SKU, nombre o número de parte (el orden de captura y la agencia cambian: ver decisión 7); los precios que se ven son de apoyo y el servidor los recalcula al guardar. Una línea bajo pedido lleva número de parte (solo lo ve el vendedor, no sale en la hoja) y precio aproximado capturado a mano hasta que exista la lista de precios del REPORTEADOR.
- `sw.js`: service worker. El nombre de caché es fijo (`catalogo-bh-shell`); no hace falta subir versión a mano.
- `manifest.json` e iconos (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.ico`) e `imagen-no-disponible.png`.
- Backend: repo `coodinadorgenref-GC/apps-script` (se sube con clasp). Los archivos .gs que alimentan el API:
  - `Código.js`: login, sesiones, roles, carritos, cotizaciones, bitácora, Telegram.
  - `Inventario_base.js`: inventario del catálogo leído de DATOS, con los filtros en código.
  - `Precios_venta.js`: precios calculados en el servidor; el COSTO nunca sale del servidor.
  - `Cotizaciones.js`: hoja `COTIZACIONES` (una fila por folio `C00001`…), `guardarCotizacion`, `listarCotizaciones`, `cambiarEstadoCotizacion` (Borrador · Enviada · Aceptada · Rechazada · Cancelada). El folio sale de un contador (`FOLIO_COTIZACION` en Propiedades del script) con candado; los precios los calcula el servidor.
  - `Sesion_rol.js`, `Codigo_Reporteador.js`, `Cierres_mensuales.js`, `Subidas_y_meses.js`, `Talleres.js`, `Inventario_pegado.js`.
- Datos: Google Sheets, expuestos por el Worker de Cloudflare `catalogo-labarata-proxy`.
- Apps hermanas: REPORTEADOR (dashboard) y Maps (prospectos, rutas y notas de venta).

## Roles (columna F de `Usuarios_Autorizados`)
- `admin`: permisos completos; es el único "admin real" (Maps, Talleres, Reporteador completo).
- `vendedor`: mismos permisos que admin dentro del catálogo; además entra a Maps.
- `gerente` (nuevo): mismos permisos que vendedor en el catálogo, **sin acceso a Maps** por ahora. El servidor usa `_tienePermisosDeAdmin` (`Código.js`), pero el login le manda `esAdmin:false` y `esGerente:true`; así Maps lo rechaza solo y el catálogo lo trata como admin con `esAdmin || esGerente`. En el REPORTEADOR entra con alcance de vendedor (solo la agencia de su columna H) y ve Talleres solo de esa agencia (`obtenerTalleres`).
- Cualquier otro valor (vacío, cliente): cliente con carrito.

## Reglas que no se rompen
- Los permisos se calculan siempre en el servidor, nunca con lo que manda el cliente.
- Los filtros de inventario viven en el código, no en pestañas de Sheets.
- El cliente nunca ve el costo; los precios solo los ve el vendedor.
- Antes de entregar cambios en `index.html`, revisar la sintaxis de sus scripts (`node --check`).
- Cada cambio en un .gs debe indicar qué buscar y qué cambiar.

## Decisiones tomadas (oct-2026)
1. Rol Gerente: permisos de Vendedor en el catálogo, sin acceso a Maps.
2. Dos flujos de cotización:
   - **Piso de venta**: el vendedor captura nombre, teléfono y SKU (misma captura que Nueva venta en Maps). Si es bajo pedido, captura el número de parte; solo el vendedor lo ve y no aparece en la hoja de cotización.
   - **Catálogo (carrito del cliente)**: el cliente llena el carrito y solo el vendedor ve los precios.
3. Hoja de cotización tipo factura, tamaño carta, un solo formato con el logo cargado de forma predeterminada (sin selector de agencia; ver decisión 7). Referencia: `generarPdfNotaVenta` en `nota-venta.js` del repo Maps.
4. Dos listas de precios: una para Maps y otra para el catálogo (esta incluye todas las agencias, también Bajaj y Suzuki). Se suben en el REPORTEADOR (pendiente de agregar).
5. La captura de "Nueva venta" de Maps se replica en el catálogo.
6. Se reestructura la interfaz y el flujo de trabajo con el skill UI/UX Pro Max.
7. **Flujo de toda cotización** (16-oct): siempre empieza por el **ID del cliente**; si existe, se traen todos sus datos. Después: nombre y teléfono, Motocicleta (opcional) y Año (opcional), y luego los productos. Se elimina la **Agencia** (logos de la hoja): la hoja carga un logo de forma predeterminada. La lista de precios se toma de otra fuente; en esa lista sí están Bajaj y Suzuki.
8. **Se quita Buscar por Foto** (16-oct), en `index.html` y en los .gs. En `index.html`: botones `btn-buscar-foto-desktop` y `btn-buscar-foto-movil`, modal "Buscar por Foto", `abrirModalBuscarFoto`, `analizarFotoBusqueda` y todo su bloque JS. En `Código.js`: `analizarFotoProducto` y su ruta en `doPost`; después, borrar `GROQ_API_KEY` de las Propiedades del script. La galería de fotos de producto (`subirFotoProducto`, `eliminarFotoProducto`, `reordenarFotosProducto`) no es parte de esto y se queda.
9. **Configuración** (16-oct): panel oculto, al estilo de Maps y del REPORTEADOR, con tres secciones: **Aspecto** (Claro, Oscuro, Igual que el sistema), **Cuenta y versión** y **Cotizaciones** (las mismas funciones que en Maps: historial, consulta, reenviar, etc.).
10. **Maps ya no atiende el catálogo** (16-oct): se borra todo lo relacionado. En `index.html`: el botón "Cotizar en Maps" de las tarjetas de Pendientes y `abrirCotizacionEnMaps`. En `Código.js`: el enlace "Cotizar en Maps" del mensaje de Telegram. Para el cliente se agrega el botón **Cotizar en ruta**, que sí lleva a Maps (una sola constante con la URL). Lo que Maps usa para su propio acceso (`esVendedor`, `esAdminReal`, `validarSesion`) no se toca hasta confirmarlo.
11. **Rediseño de toda la interfaz** (16-oct) con UI/UX Pro Max: experiencia intuitiva y natural. Como el aspecto será Claro/Oscuro/Sistema, el diseño necesita tokens para los dos temas (`MASTER.md` §3).

## Pendiente (en orden)
1. Rol Gerente: listo en backend, catálogo y REPORTEADOR (v74: entra con alcance de vendedor y ve Talleres de su agencia). Falta probarlo con una cuenta `gerente` (columna F) con agencia en la columna H.
2. Sistema visual (MASTER.md): hecho y aplicada la capa base en `index.html` (16-oct): tokens, contraste AA en botones y grises, fuentes Rubik + Nunito Sans, texto mínimo de 11 px, `aria-label`/`aria-hidden`/`aria-live`, foco visible, imágenes `loading="lazy"`, emojis sustituidos por Font Awesome. Queda lo estructural, que va con la etapa 6: barra inferior móvil, tarjeta de producto, modales como hoja inferior y áreas táctiles de 44 px.
3. Listas de precios en el REPORTEADOR hacia el API.
4. Cotización en piso de venta: captura, folio y guardado hechos (falta desplegar `Cotizaciones.js` en Apps Script y probar). Falta: que "Atender" en Pendientes abra la cotización en el catálogo con los SKU del carrito (hoy abre Maps), lista de mis cotizaciones con cambio de estado en la interfaz, y el precio por número de parte desde la lista de precios del REPORTEADOR.
5. Hoja de cotización tipo factura por agencia (el catálogo aún no carga jsPDF ni tiene hoja carta).
6. Reestructura de la interfaz.
7. **Fallos visibles (16-oct)**: el botón "Cotizar" se pierde entre los demás botones flotantes, y las etiquetas "Pendientes" y "Cotización" se desbordan del ícono. Reglas de corrección en `MASTER.md` §7.
8. Cotización: nuevo orden de captura con ID de cliente primero (autollenado) y sin Agencia, logo predeterminado en la hoja (decisión 7).
9. Quitar Buscar por Foto del index y de los .gs (decisión 8).
10. Panel oculto Configuración: Aspecto, Cuenta y versión, Cotizaciones (decisión 9), con tema claro/oscuro/sistema.
11. Quitar Maps del catálogo y agregar "Cotizar en ruta" para el cliente (decisión 10).

## Por confirmar
- Configuración: ¿la ven todos los roles o solo admin, vendedor y gerente? ¿Cómo se abre (ícono oculto, gesto, otra forma)? ¿Con qué aspecto arranca?
- "Cotizar en ruta": ¿lleva el carrito del cliente a Maps o solo abre Maps?
- ID de cliente: ¿de dónde se traen sus datos (hoja de clientes, `Usuarios_Autorizados`, Maps)?
- Lista de precios "de otra fuente": ¿es la que se sube en el REPORTEADOR o una hoja distinta?
- Maps: confirmar que `esVendedor`, `esAdminReal` y `validarSesion` se quedan, porque los usa para su propio acceso.

## Cómo probar
1. Subir `index.html`, `sw.js` y `README.md` a GitHub Pages y recargar.
2. Rol Gerente: en `Usuarios_Autorizados` poner `gerente` en la columna F de una cuenta de prueba. Debe ver el catálogo como vendedor y no debe poder entrar a Maps.
