# THF 2026 · Web

Sitio del Tampico Hybrid Fest: registro de atletas, armado de equipo y cobro de
la inscripción por Mercado Pago.

Next.js 16 (App Router) + TypeScript + Tailwind + Supabase.

---

## El flujo, tal como en el prototipo

```
Landing  →  Login  →  Perfil  →  crear equipo (2 atletas + emblema)
                                      ↓
                                 pagar inscripción      ← el cobro vive AQUI
                                      ↓
                              credencial QR liberada
```

El cobro no es una página aparte: es el último paso del armado de equipo, dentro
del perfil. Igual que en `Tampico Hybrid Fest - Profile.dc.html`.

| Ruta | Qué hace |
|---|---|
| `/` | Landing con las dos divisiones |
| `/login` | Registro y acceso de atletas |
| `/perfil` | Equipo, emblema, pago y credencial. Requiere sesión |
| `/pago/exito` · `/pendiente` · `/error` | Retorno desde Mercado Pago |
| `/quiz` | Quiz de categoría, 5 preguntas |
| `/community` · `/open` | Las dos categorías |
| `/leaderboard` | Parejas confirmadas, con datos reales de la base |
| `/admin` | Panel del staff: WODs y validación de pagos. Requiere rol |
| `/prototipo` | Los `.dc.html` sin migrar (hoy solo THF Game). **Temporal** |
| `/inscripcion` | Redirige a `/perfil`. Existió como atajo antes del login |

---

## Arrancar en local

Necesitas Docker corriendo (Supabase local vive en contenedores).

```bash
npx supabase start          # base de datos + auth. La primera vez baja ~2 GB
cp .env.example .env.local  # y pon ahi las llaves que imprime el comando
npm run dev                 # http://localhost:3000
```

`supabase start` imprime `API_URL`, `ANON_KEY` y `SERVICE_ROLE_KEY`. Esas tres
van a `.env.local`. Son las mismas en cualquier máquina: son locales, no son
secretos.

Otros comandos útiles:

```bash
npx supabase status         # URLs y llaves otra vez
npx supabase db reset       # borra todo y reaplica las migraciones
npx supabase stop           # apaga los contenedores
```

- **Studio** (ver y editar datos): http://127.0.0.1:54323
- **Mailpit** (correos de confirmación): http://127.0.0.1:54324

### Pruebas

Con `supabase start` y `npm run dev` corriendo, en otra terminal:

```bash
npm run smoke           # páginas, webhook y políticas de acceso (RLS)
npm run smoke:session   # el flujo completo con sesión iniciada
npm run smoke:prices    # que el precio no lo pueda decidir el cliente
npm run smoke:leaderboard  # que el leaderboard publique solo lo que debe
npm run smoke:admin        # que al panel solo entre el staff
```

### Darte permisos de staff

El panel `/admin` pide rol `staff` o `admin`, y nadie lo tiene al registrarse.
Crea tu cuenta en `/login` y luego, en el SQL editor
([Studio local](http://127.0.0.1:54323) o el panel de Supabase):

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'tu@correo.com');
```

Vuelve a cargar `/admin` y ya entras.

Con un `MP_ACCESS_TOKEN` falso, los casos que salen a Mercado Pago fallan a
propósito (502 y 500). Eso es parte de lo que se verifica: que el código llega
hasta allá en vez de inventarse una respuesta.

---

## Base de datos

Cuatro tablas en `supabase/migrations/`:

- `profiles` — un perfil por usuario, creado por trigger al registrarse
- `teams` — un equipo por capitán (índice único), con el precio congelado al
  momento de crearlo
- `team_members` — los dos atletas
- `payments` — un renglón por pago de Mercado Pago; el id de MP es la llave
  primaria, y eso es lo que hace idempotente al webhook

### Lo que RLS impide (y está probado)

| Intento | Resultado |
|---|---|
| El capitán marca su propio equipo como pagado | Rechazado |
| Un atleta inserta un pago inventado | Rechazado |
| Un atleta manda `amount_mxn: 1` al crear o editar su equipo | Se ignora: el trigger lo repone desde `price_phases` |
| Un atleta edita el catálogo `price_phases` | Rechazado |
| Un atleta crea equipos sin pagar para empujar la fase | No cuentan: el cupo sólo mira las parejas pagadas |
| Un equipo pagado cambia de categoría | Rechazado; conserva precio y división |
| Un atleta ve o borra el equipo de otro | No lo ve, no lo borra |
| Un atleta registra un segundo equipo | Rechazado |
| Borrar un equipo ya pagado | Rechazado |

Sólo el webhook, con la service role key, puede escribir en `payments` y mover
un equipo a `paid`.

---

## Configurar Mercado Pago

### 1. Credenciales

Panel → **Tus integraciones** → app de tipo *Pagos online · Checkout Pro* →
**Credenciales**. Hay dos juegos y no se mezclan:

| Entorno | Access token |
|---|---|
| Prueba | `TEST-...` |
| Producción | `APP_USR-...` |

El access token va **solo** en variables de entorno del servidor. Nunca en el
cliente, nunca con prefijo `NEXT_PUBLIC_`, nunca en el repo.

### 2. Usuarios de prueba

Con credenciales `TEST-` no puedes pagarte a ti mismo con tu cuenta real.
Necesitas dos **usuarios de prueba** (panel → tu app → Cuentas de prueba): uno
vendedor, cuyas credenciales van a `MP_ACCESS_TOKEN`, y uno comprador, con el que
inicias sesión al pagar.

El nombre del titular en las tarjetas de prueba decide el resultado: `APRO`
aprueba, `OTHE` rechaza, `CONT` deja el pago pendiente. Prueba los tres — sobre
todo `CONT`, que es el caso de OXXO y el que más se rompe en producción.

### 3. Webhook

Panel → tu app → **Webhooks**:

- URL: `https://TU-DOMINIO/api/webhooks/mercadopago`
- Evento: **Pagos**
- Copia el secreto de firma a `MP_WEBHOOK_SECRET`

Mercado Pago pega un `GET` a la URL antes de guardarla, por eso el handler
responde también a `GET`.

**En local** necesitas una URL pública: levanta `ngrok http 3000` y pon esa URL
en `APP_BASE_URL`. Sin eso el código detecta que estás en localhost, omite
`notification_url` y avisa por consola de que la confirmación no va a llegar.

---

## Cómo funciona el cobro

```
[/perfil] botón "Pagar con Mercado Pago"
   └─ POST /api/checkout          ← sin cuerpo: el equipo sale de la sesión
        ├─ lee el monto DESDE LA BASE
        └─ crea la preference con external_reference = teamId
             └─ redirige a Checkout Pro

[el atleta paga]
   ├─ vuelve a /pago/exito|pendiente|error   ← sólo experiencia de usuario
   └─ Mercado Pago llama a /api/webhooks/mercadopago   ← FUENTE DE VERDAD
        ├─ valida la firma HMAC (x-signature) + ventana anti-replay
        ├─ consulta el pago contra la API de MP
        └─ si status = approved → el equipo pasa a "paid"
```

Tres cosas que no son negociables y que ya están resueltas:

1. **El precio lo pone el servidor.** El request de checkout va vacío; el monto
   sale de la base y se recalcula con la fase vigente justo antes de crear la
   preference. No hay forma de pedir un cobro por otro importe.
2. **El webhook es la única fuente de verdad.** Las `back_urls` se pueden
   escribir a mano, y el atleta puede cerrar la pestaña sin volver.
3. **Todo es idempotente.** Mercado Pago reintenta y manda varias
   notificaciones por el mismo pago conforme cambia de estado.

### El precio sube por fases

El sitio anuncia cuatro tramos: conforme se llenan lugares, sube la inscripción
de las dos divisiones. Viven en `price_phases`:

| Fase | Cupo acumulado | Community (CM) | Open / Full Weekend (OP) |
|---|---|---|---|
| 1 · Founders | 1–50 parejas | $2,000 | $2,300 |
| 2 | 51–120 | $2,200 | $2,500 |
| 3 | 121–200 | $2,400 | $2,700 |
| Final | 201+ | $2,600 | $2,900 |

Tres reglas que se decidieron con el cliente y que están en el código:

- **La fase la cambia el staff con un botón**, desde el panel `/admin`. No es
  un automatismo: el conteo de parejas pagadas (`paid_pairs()`) se muestra como
  referencia para decidir cuándo apretar, pero no dispara nada. Sólo una fase
  puede estar activa a la vez (trigger `price_phases_single_active`).
- **Sólo cuentan las parejas pagadas** en ese conteo de referencia. Un equipo
  creado y nunca pagado no suma.
- **El precio se fija al pagar, no al armar el equipo.** Lo que se ve en el
  perfil antes de pagar es una cotización; `refreshTeamPrice()` lo recalcula
  justo antes de crear la preference con la fase activa en ese momento.

Un equipo ya pagado conserva su monto aunque la fase cambie después. Sin
ninguna fase activa, el alta se rechaza en vez de cobrar un importe inventado.

La vista `current_phase` publica la fase activa y sus precios. **Todo precio
que se pinta en el sitio** (landing, categorías, quiz, constructor, selector
de división, leaderboard) sale de ahí vía `lib/phases.ts` — nunca de un número
quemado en el código.

### Estados de pago

Sólo `approved` libera la inscripción. `pending` e `in_process` son normales
(efectivo en tienda, revisión antifraude) y pueden tardar horas o días — por eso
`/pago/pendiente` se refresca solo en vez de afirmar nada.

---

## Deploy a Vercel

1. Crea un proyecto en [supabase.com](https://supabase.com) y aplica las
   migraciones (`npx supabase link` + `npx supabase db push`, o pega los
   archivos de `supabase/migrations/` en el SQL editor **en orden**).
2. Sube el repo a GitHub e impórtalo en Vercel.
3. Variables de entorno en Vercel → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `MP_ACCESS_TOKEN` | `APP_USR-...` en Production, `TEST-...` en Preview |
| `MP_WEBHOOK_SECRET` | el secreto del panel de MP |
| `NEXT_PUBLIC_SUPABASE_URL` | del panel de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | del panel de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | del panel de Supabase. **Nunca en el cliente** |
| `APP_BASE_URL` | opcional; Vercel la resuelve sola |

4. Después del primer deploy, apunta el webhook de Mercado Pago al dominio de
   producción.

En Supabase → Authentication → URL Configuration, agrega tu dominio a las redirect
URLs, o los correos de confirmación apuntarán a localhost.

---

## Pendientes

- [ ] **THF Game**: en pausa por decisión del cliente. El prototipo se conserva
      en `/prototipo` y la landing sigue enlazando ahí.
- [ ] **Sponsors**: fuera del alcance acordado.
- [ ] Foto del atleta en el perfil: el prototipo trae un `<image-slot>` para
      arrastrar la imagen, y eso necesita Supabase Storage. Hoy se muestra la
      inicial sobre el degradado naranja.
- [ ] Correo de confirmación al aprobarse el pago.
- [ ] Invitar al segundo atleta a crear cuenta (hoy `team_members.profile_id`
      queda nulo hasta que se registre).
- [ ] Optimizar los assets: hay PNGs de 1–3 MB en `../assets`. Pasarlos a WebP y
      servirlos con `next/image`.
- [ ] Borrar `public/prototipo/` cuando termine la migración.

---

## Sobre el diseño

La Landing (`src/app/page.tsx`) es el port fiel de
`Tampico Hybrid Fest - Landing.dc.html`: mismo markup, mismos estilos inline,
mismas animaciones. Lo único que cambió:

- Las rutas de imágenes apuntan a `/assets/` (copiadas a `public/`).
- Los enlaces a páginas ya migradas van a su ruta de Next; el resto sigue
  apuntando a `/prototipo/` hasta que les toque.
- El atributo `style-hover` del runtime de DC —que no existe en HTML— es CSS
  real (`.thf-trait-card:hover`, `.thf-step-row:hover`).
- El WOD del día y la cuenta regresiva son componentes de cliente, para que la
  hora sea la del atleta y no la del servidor.

Al migrar las páginas que faltan, el criterio es el mismo: copiar el markup del
prototipo tal cual y sustituir `<sc-for>` por `.map()` y `<sc-if>` por un
condicional. **No rediseñar.**

> El proyecto vive en `C:\dev\THF`, fuera de OneDrive: la sincronización metía
> archivos `desktop.ini` dentro de `src/` y eso tumbaba el watcher de Next.
