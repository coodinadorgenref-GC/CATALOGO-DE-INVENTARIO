# ESTADO — Catálogo de Inventario (Grupo Camejo)

## Qué es
PWA de un solo archivo con el catálogo de refacciones de Grupo Camejo. La usan administración, vendedores y clientes (con login). Corre en GitHub Pages y lee/escribe en Google Sheets mediante Apps Script.

## Cómo está armado
- `index.html`: toda la app (login, catálogo, carrito del cliente, panel de Cotizaciones Pendientes, galería de fotos). Estilos con Tailwind (CDN) y los tokens de `MASTER.md` en `:root` (`--brand`, `--surface`, `--text-3`…). Botones verdes con `.btn-primary`, ámbar con `.btn-attention`, insignias con `.badge-brand`; no volver a usar `bg-emerald-600 text-white` (no pasa contraste).
- `MASTER.md`: sistema visual del rediseño (fuente única de verdad del diseño).
- **Cotizar en piso de venta** (`index.html`, bloque `js-cotizar-piso`, prefijo `cotPiso*`/`_cp*`): botón flotante "Cotizar" solo para `esAdmin` (admin, vendedor, gerente). Captura ID de cliente, nombre, teléfono, motocicleta y año (opcionales) y productos por SKU, nombre o número de parte; sin selector de Agencia (decisión 7). Los precios que se ven son de apoyo y el servidor los recalcula al guardar. Una línea bajo pedido lleva número de parte (solo lo ve el vendedor, no sale en la hoja) y precio aproximado capturado a mano hasta que exista la lista de precios del REPORTEADOR.
- **Hoja de cotización** (`index.html`, bloque `HOJA_COTIZACION_INICIO … FIN`): PDF tamaño carta, tipo factura, siempre claro. `hojaCotizacionConstruir` arma el PDF (jsPDF 2.5.1, se carga solo la primera vez), `hojaCotizacionPdf` lo comparte en el celular o lo descarga. Botón **Hoja PDF** al guardar la cotización y en Configuración → Cotizaciones. Lleva fecha, folio, cliente (con ID), teléfono, asesor, motocicleta y año si se capturaron, partidas con importe, total y notas; partidas sin precio salen "Por confirmar" y no suman, precios aproximados llevan `*`. Nunca lleva número de parte ni costos. Logo de la hoja según la agencia del asesor, que se deduce de su almacén (columna H): **Vento**, **Carabela**, **Suzuki** o **Bajaj** (cualquier sucursal Bajaj) llevan su logo. Con "TODAS", vacío u otro almacén la agencia queda `GENERAL`: sin logo, con el nombre "La Barata del Hogar". Si la cuenta es **vendedor**, la hoja también lleva su agencia (columna H) y su WhatsApp (columna G); admin y gerente no.
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
3. Hoja de cotización tipo factura, tamaño carta, un solo formato; el logo lo define la agencia del asesor, sin selector (ver decisión 7). Referencia: `generarPdfNotaVenta` en `nota-venta.js` del repo Maps.
4. Dos listas de precios: una para Maps y otra para el catálogo (esta incluye todas las agencias, también Bajaj y Suzuki). Se suben en el REPORTEADOR (pendiente de agregar).
5. La captura de "Nueva venta" de Maps se replica en el catálogo.
6. Se reestructura la interfaz y el flujo de trabajo con el skill UI/UX Pro Max.
7. **Flujo de toda cotización** (16-oct, ajustada 17-oct): siempre empieza por el **ID del cliente**; si existe, se traen todos sus datos. Después: nombre y teléfono, Motocicleta (opcional) y Año (opcional), y luego los productos. Se elimina el selector de **Agencia**. La hoja lleva el logo de la agencia del asesor: Vento, Carabela, Suzuki o Bajaj (el resto, sin logo). La lista de precios se toma de otra fuente; en esa lista sí están Bajaj y Suzuki.
8. **Se quita Buscar por Foto** (16-oct), en `index.html` y en los .gs. En `index.html`: botones `btn-buscar-foto-desktop` y `btn-buscar-foto-movil`, modal "Buscar por Foto", `abrirModalBuscarFoto`, `analizarFotoBusqueda` y todo su bloque JS. En `Código.js`: `analizarFotoProducto` y su ruta en `doPost`; después, borrar `GROQ_API_KEY` de las Propiedades del script. La galería de fotos de producto (`subirFotoProducto`, `eliminarFotoProducto`, `reordenarFotosProducto`) no es parte de esto y se queda.
9. **Configuración** (16-oct): panel oculto, al estilo de Maps y del REPORTEADOR, con tres secciones: **Aspecto** (Claro, Oscuro, Igual que el sistema), **Cuenta y versión** y **Cotizaciones** (las mismas funciones que en Maps: historial, consulta, reenviar, etc.).
10. **Maps ya no atiende el catálogo** (16-oct): se borra todo lo relacionado. En `index.html`: el botón "Cotizar en Maps" de las tarjetas de Pendientes y `abrirCotizacionEnMaps`. En `Código.js`: el enlace "Cotizar en Maps" del mensaje de Telegram. Para el cliente se agrega el botón **Cotizar en ruta**, que sí lleva a Maps (una sola constante con la URL). Lo que Maps usa para su propio acceso (`esVendedor`, `esAdminReal`, `validarSesion`) no se toca hasta confirmarlo.
11. **Rediseño de toda la interfaz** (16-oct) con UI/UX Pro Max: experiencia intuitiva y natural. Como el aspecto será Claro/Oscuro/Sistema, el diseño necesita tokens para los dos temas (`MASTER.md` §3).

## Pendiente (en orden)
1. Rol Gerente: listo en backend, catálogo y REPORTEADOR (v74: entra con alcance de vendedor y ve Talleres de su agencia). Falta probarlo con una cuenta `gerente` (columna F) con agencia en la columna H.
2. Sistema visual (MASTER.md): hecho y aplicada la capa base en `index.html` (16-oct): tokens, contraste AA en botones y grises, fuentes Rubik + Nunito Sans, texto mínimo de 11 px, `aria-label`/`aria-hidden`/`aria-live`, foco visible, imágenes `loading="lazy"`, emojis sustituidos por Font Awesome. Queda lo estructural, que va con la etapa 6: barra inferior móvil, tarjeta de producto, modales como hoja inferior y áreas táctiles de 44 px.
3. Listas de precios en el REPORTEADOR hacia el API.
4. Cotización en piso de venta: captura, folio y guardado hechos (falta desplegar `Cotizaciones.js` en Apps Script y probar). Falta: que "Atender" en Pendientes abra la cotización en el catálogo con los SKU del carrito (el botón a Maps ya se quitó de las tarjetas de Pendientes), lista de mis cotizaciones con cambio de estado en la interfaz, y el precio por número de parte desde la lista de precios del REPORTEADOR.
5. **Hecho en código (17-oct), falta probar en el celular y desplegar**: hoja de cotización tipo factura con logo por agencia (Vento, Carabela, Suzuki, Bajaj), contacto del vendedor (agencia y WhatsApp, solo si la cuenta es vendedor) y botón Hoja PDF. Falta subir `Cotizaciones.js` (agencias `CARABELA` y `GENERAL`, columnas nuevas `vendedorAgencia` y `vendedorWhats`; si la hoja `COTIZACIONES` ya existe con el encabezado anterior se migra sola) y la lista de precios del REPORTEADOR.
6. Reestructura de la interfaz. La barra inferior móvil y el rediseño estructural quedan para después, por indicación (17-oct).
7. **Hecho en `index.html` (16-oct), falta probar en celular** — fallos visibles: el botón "Cotizar" se pierde entre los demás botones flotantes, y las etiquetas "Pendientes" y "Cotización" se desbordan del ícono. Reglas de corrección en `MASTER.md` §7.
8. **Hecho (16-oct)**: captura con ID de cliente primero (autollena nombre y teléfono desde la hoja `Mecanicos`: B = ID, C = nombre, E = teléfono; `buscarMecanico` en `Cotizaciones.js`) y sin selector de Agencia (se deduce del almacén del asesor; define el logo de la hoja). Falta subir `Código.js` y `Cotizaciones.js` a Apps Script.
9. **Hecho (16-oct)**: Buscar por Foto quitado del index y de `Código.js` (`analizarFotoProducto` y su ruta). Falta subir `Código.js` a Apps Script y borrar `GROQ_API_KEY` de las Propiedades del script.
10. **Hecho (17-oct)**: panel Configuración (engrane en la cabecera) con **Aspecto** (Claro, Oscuro, Sistema; se guarda en el dispositivo; arranca en Oscuro), **Cuenta y versión** (con "Forzar recarga", igual que el REPORTEADOR) y **Cotizaciones** (lista de las tuyas, búsqueda, ver líneas, cambiar estado, reenviar por WhatsApp sin número de parte). El aspecto claro funciona con tokens en el CSS propio y con una escala de colores de Tailwind invertida (`:root[data-theme="light"]`); las clases de color fijo del HTML no se tocaron. Falta revisar pantalla por pantalla en claro.
11. **Hecho (16-oct)**: botón "Cotizar en Maps" quitado de Pendientes, enlace a Maps quitado del mensaje de Telegram, y botón "Cotizar en ruta" en el pie del carrito del cliente (abre Maps sin datos). Falta subir `Código.js` a Apps Script.
12. **Hecho en código (17-oct), falta probar en el celular y desplegar `Código.js`**: seguimiento paso a paso de las cotizaciones solicitadas por clientes (Atender → Revisar → Enviar → Cerrar, candado por cliente, hoja `Seguimiento_Solicitudes`), lista de pendientes más rápida, diálogos con la paleta del catálogo y cantidad del carrito que nunca elimina el producto. Ver «Seguimiento de la cotización solicitada por el cliente».

## Por confirmar
- Configuración: hoy el engrane lo ven todos los usuarios con sesión y la pestaña Cotizaciones solo los asesores; ¿se deja así o se oculta de otra forma? ¿Con qué aspecto arranca?
- "Cotizar en ruta": ¿lleva el carrito del cliente a Maps o solo abre Maps?
- Lista de precios "de otra fuente": ¿es la que se sube en el REPORTEADOR o una hoja distinta?
- Maps: confirmar que `esVendedor`, `esAdminReal` y `validarSesion` se quedan, porque los usa para su propio acceso.
- Hoja de cotización: ¿se agrega también dirección o teléfono de la agencia, además de la agencia y el WhatsApp del vendedor?

## Cómo probar
1. Subir `index.html`, `sw.js` y `README.md` a GitHub Pages y recargar.
2. Rol Gerente: en `Usuarios_Autorizados` poner `gerente` en la columna F de una cuenta de prueba. Debe ver el catálogo como vendedor y no debe poder entrar a Maps.

## Seguimiento de la cotización solicitada por el cliente (17-oct)
El cliente envía su carrito con "Cotización general"; el asesor la atiende paso a paso. **Atender toma los productos de tu almacén**: si el cliente pidió también de otro almacén, esa parte se separa como solicitud propia, sin dueño, y la toma el asesor de ese almacén (el candado por cliente solo aplica entre asesores del mismo almacén; el servidor lo valida). Solo quien la atiende avanza, quita productos, envía y cierra; un asesor de Zona Valladolid puede liberarla para reasignarla.

```mermaid
flowchart TD
    A([Cliente envía su cotización general]) --> B[Solicitada<br/>sin dueño, visible a los asesores del almacén]
    B -->|Atender| C[En atención<br/>tuya; otro asesor de tu almacén no la puede tomar]
    C -->|Quitar productos no disponibles| C
    C -->|Marcar revisada| D[Revisada]
    D -->|Volver a revisar| C
    D -->|Enviar por WhatsApp| E[Enviada<br/>espera la respuesta del cliente]
    E -->|Corregir| D
    E -->|Cerrar| F{Resultado}
    F -->|Pedido listo| G([Cerrada])
    F -->|Sin respuesta| G
    F -->|Cancelada| G
    C -.->|Cancelada, en cualquier paso| G
    C -->|Liberar| B
    D -->|Liberar| B
    E -->|Liberar| B
    G --> H[(Seguimiento_Solicitudes<br/>quién, cuándo y cuánto tardó)]
```

- Estados y transiciones los valida `Código.js`: `atenderCotizacion`, `avanzarPasoCotizacion`, `cerrarCotizacion`, `liberarCotizacion`. El paso vive en el bloque (columna G de `Carritos_Activos`) junto con `atendidoPor` e `historial`.
- "Pedido listo" y "Sin respuesta" exigen haber enviado antes; "Cancelada" se puede en cualquier paso.
- Al cerrar se quitan los productos del almacén del asesor. Si el cliente pidió también productos de otro almacén, esa parte sigue en la lista, sin dueño.
- Cada cierre deja un renglón en la hoja `Seguimiento_Solicitudes` (se crea sola): cierre, resultado, cliente, asesor, solicitada, tomada, enviada, minutos hasta tomarla y hasta enviarla, productos.
- Velocidad de la lista de pendientes: el servidor lee `Usuarios_Autorizados` una sola vez, guarda 20 s la respuesta por almacén (se descarta al instante cuando alguien escribe en `Carritos_Activos`) y guarda 10 min el ID de cliente por correo; el panel pinta de inmediato lo último que sabe y se actualiza encima, y los botones responden al instante y se revierten si el servidor dice que no. La caché del panel vive en `sessionStorage` (se borra al cerrar la pestaña o la sesión).
- Cantidad del carrito del cliente: nunca baja de 1; para quitar un producto está solo la papelera.
- Diálogos propios (`dialogoApp`, `confirmarApp`) con la paleta del catálogo en lugar de `confirm`/`alert` en el carrito, el envío general y Pendientes. Quedan `alert`/`confirm` del navegador en fotos, cierre de sesión por inactividad y "Descartar cotización".
- `marcarCotizacionEnviada` y su ruta quedan en el servidor solo por compatibilidad con versiones viejas ya abiertas; se pueden borrar cuando todos hayan actualizado.

## Logo de la hoja de cotización (17-oct)
Logos tomados de `logos-marcas.js` del repo Maps (PNG de 90 px de alto) y guardados como archivos propios del catálogo, ya cacheados en `sw.js`: `logo-vento.png` (444×90), `logo-carabela.png` (472×90), `logo-suzuki.png` (470×90) y `logo-bajaj.png` (437×90). Se usan solo esos cuatro (los demás de Maps —BDS, American Piston, Islo, ATUL, TVS, Piaggio— no entran). Regla: Logo de la hoja según la agencia del asesor, que se deduce de su almacén (columna H): **Vento**, **Carabela**, **Suzuki** o **Bajaj** (cualquier sucursal Bajaj) llevan su logo. Con "TODAS", vacío u otro almacén la agencia queda `GENERAL`: sin logo, con el nombre "La Barata del Hogar". Si la cuenta es **vendedor**, la hoja también lleva su agencia (columna H) y su WhatsApp (columna G); admin y gerente no. En el servidor, `AGENCIAS_COTIZACION` ahora es `VENTO · CARABELA · BAJAJ · SUZUKI · GENERAL` (`Cotizaciones.js`);

## Búsqueda de cliente (17-oct)
En Cotizar, el campo "Cliente" busca en la hoja `Mecanicos` por ID, nombre (todas las palabras, sin acentos) o teléfono (4+ dígitos) y muestra hasta 8 coincidencias con su ID (`buscarMecanico(correo, consulta)` en `Cotizaciones.js`).

## Aspecto claro/oscuro (17-oct)
- `data-theme` en `<html>` lo pone un script antes de pintar (preferencia `aspecto` en `localStorage`: claro, oscuro o sistema; sin preferencia arranca oscuro). `matchMedia` lo sigue cuando está en Sistema y se actualiza `theme-color`.
- Los colores fijos del CSS propio (51 declaraciones) pasaron a tokens: `--divider`, `--hover`, `--border-strong`, `--info-text`, `--info-bg`, `--danger-bg`, `--ok`, `--brand-text`, `--attention-text`.
- Para las ~560 clases de color fijo de Tailwind en el HTML no se reescribió nada: en claro se invierte la escala `--color-slate-*` y se ajustan emerald/red/amber/blue; `border-slate-*` usa `--border`; `text-white` pasa a `--text` salvo sobre fondos de color sólido.
- `sw.js` no lleva número de versión (caché primero, actualiza detrás); para traer una versión nueva al instante está **Forzar recarga**.
- Candado por almacén: `atenderCotizacion` separa en otra solicitud los productos que no son del almacén del asesor.

## Botones flotantes y aspecto claro (17-oct, 2)
- Cotizar, Cotización y Pendientes son ahora fichas tipo ícono de iPhone: 60 px, esquinas de 14 px, glifo blanco, etiqueta en una píldora debajo (ya no se corta "Pendientes"). Verde = cotizar, azul = Pendientes; el globo rojo va en la esquina de la ficha. Funciona aunque JS ponga `display: block` o `flex`.
- Aspecto claro: fondo `#eef2f7` con tarjetas blancas (antes casi del mismo tono), bordes más suaves y sombras de Tailwind atenuadas.
- "Imagen no disponible": en claro se usa `imagen-no-disponible-claro.png` (mismo dibujo, paleta clara) mediante CSS `content: url()`; `sw.js` ya la precarga. Si algún navegador no aplicara `content` en `img`, se vería la oscura.
