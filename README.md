# Café de la Madeleine · app web en React

Propuesta de sitio web para [Café de la Madeleine](https://www.instagram.com/cafedelamadeleine/), en la Calle 38 #16-25, La Magdalena, Teusaquillo, Bogotá. Es la versión con más interacción de la propuesta, y la [landing en HTML, CSS y JS](../landing/) es la versión sencilla.

Está hecha con React 18, Vite 5 y Framer Motion 11. El build genera un sitio estático que se puede publicar en cualquier hosting, sin servidor.

## Requisitos
- Node.js 18 o superior
- npm

## Uso
```bash
npm install        # instala las dependencias
npm run dev        # desarrollo: http://localhost:5520
npm run build      # genera dist/, la carpeta que se publica
npm run preview    # sirve dist/ en http://localhost:5521
npm test           # pruebas de horario y festivos de Colombia
```

## Vistas
La app usa un router por hash (`#/carta`), así que funciona en cualquier hosting estático sin configurar redirecciones.

| Ruta | Qué hace |
|---|---|
| `#/` | Portada con el módulo "Ahora" (abierto o cerrado, qué se sirve) y el mosaico "Hoy en la casa" |
| `#/carta` | Pestañas por momento del día, buscador sin tildes, filtros, detalle de cada plato y "Agregar a mi mesa". Acepta `?tab=desayunos` o `?tab=petit` |
| `#/pasteleria` | Vitrina en carrusel con visor de fotos |
| `#/jardin` | Los tres espacios de la casa (jardín, galería y Tienda de Abalorios), línea de tiempo y la cita de la chef |
| `#/agenda` | Eventos con filtros, desplegables y descarga al calendario (.ics) cuando tienen fecha |
| `#/reservar` | Reserva en 3 pasos (qué, cuándo, sus datos) que arma el mensaje de WhatsApp. Acepta `?tipo=mesa`, `especial`, `evento` o `catering` |
| `#/visitanos` | Horario, "¿Abrimos ese día?", mapa y botones para llegar y llamar |

En celular hay una barra inferior con Inicio, Carta, Agenda, Visítanos y Reservar.

## Reglas de horario y reservas
- Abre de lunes a sábado de 9:00 a. m. a 6:00 p. m. Cierra los domingos y los festivos de Colombia, que se calculan solos cada año.
- La hora se calcula siempre en horario de Bogotá (UTC-5), sin importar dónde esté el visitante.
- **Mesa:** muestra los próximos 21 días. Bloquea domingos y festivos, y el mismo día solo se puede reservar antes de las 5:00 p. m.
- **Especial del mes:** solo ofrece el día de la semana del especial. Los días fuera del mes del especial salen como "Otro plato".
- **Eventos y catering:** se piden desde mañana, para 10 personas o más. Los domingos y festivos salen como "Por confirmar".
- Al enviar, la app vuelve a revisar la fecha y el momento del día, y abre WhatsApp con el mensaje armado.

"Mi mesa" guarda los platos marcados en el `localStorage` del navegador del visitante y los incluye en el mensaje de la reserva. No es un pedido ni un pago.

## Qué se edita cada mes
Todo el contenido está en `src/data/content.js`:

- `special`: el plato del mes, con `from` y `until` (AAAA-MM-DD) y `weekday` (0 = domingo … 3 = miércoles). Cuando el mes termina, la app deja de nombrar el plato y muestra un texto genérico.
- `agenda`: eventos con `date` (un día) o `until` (temporada). Los que ya pasaron se ocultan solos. `weekly` y `from` permiten descargar un evento semanal al calendario.
- `menu`: pestañas de la carta, con sus horarios y platos.
- `hours`: horario por día.

Las fotos van en `public/img/` y se referencian con el nombre del archivo.

## Estructura
```
src/
  App.jsx          Estructura general, transiciones entre vistas y título por ruta
  pages/           Una vista por archivo (Home, MenuPage, PastryPage, GardenPage, AgendaPage, ReservePage, VisitPage)
  components/      Piezas compartidas: Header, BottomNav, Modal, DayPicker, TableDrawer, Hero, NowCard…
  lib/             Lógica sin interfaz: horario y festivos, router, calendario .ics, "Mi mesa", utilidades
  data/content.js  Contenido editable
  styles/global.css
public/img/        Fotos de los platos
```

## Accesibilidad
- Al cambiar de vista, el foco pasa al título de la vista y el lector de pantalla la anuncia.
- Los modales bloquean el fondo, se cierran con Escape y devuelven el foco al botón que los abrió.
- El calendario de días se navega con las flechas del teclado.
- Si el sistema tiene activado "reducir movimiento", la app quita las animaciones.

## Publicar
1. Cambiar `https://cafedelamadeleine.co/` en `index.html` (canonical, Open Graph y JSON-LD) por el dominio real.
2. Ejecutar `npm run build`.
3. Subir el contenido de `dist/` al hosting (Netlify, Vercel, GitHub Pages o un servidor con Nginx). Como `vite.config.js` usa `base: './'`, también funciona dentro de una subcarpeta.

## Pendiente con el cliente
- Confirmar la carta completa y los precios. Hoy solo aparece el Petit Déjeuner a $28.000, que es el único precio publicado.
- Pedir fotos del jardín, la fachada y la galería. Por ahora se usan las fotos de platos de su Instagram.
