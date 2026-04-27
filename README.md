# 🛍️ Ecommerce App

Plataforma de comercio electrónico completa construida con Next.js 16, Supabase, Stripe y Resend. Incluye tienda para clientes y panel de administración, con soporte para modo oscuro, pagos reales y confirmación de órdenes por correo.

## ✨ Funcionalidades

### Tienda (Cliente)
- Catálogo de productos con búsqueda y filtros por categoría
- Detalle de producto con galería de imágenes
- Carrito de compras persistente (localStorage)
- Checkout con pago real mediante Stripe
- Historial de órdenes con detalle por orden
- Confirmación de compra por correo electrónico
- Modo oscuro / claro

### Panel de Administración
- Dashboard con métricas: ingresos, órdenes, productos y usuarios
- Gestión de productos (crear, editar, eliminar, subir imágenes)
- Gestión de categorías
- Listado de ventas con estado de pago

### Autenticación
- Registro e inicio de sesión con Supabase Auth
- Recuperación de contraseña por correo
- Roles: `customer` y `admin`
- Protección de rutas por middleware y server-side

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| Pagos | Stripe (Payment Intents + Webhooks) |
| Emails | Resend |
| Estado global | Zustand |
| Validación | Zod + React Hook Form |
| Fuentes | Playfair Display + Plus Jakarta Sans |
| Deploy | Vercel |

## 🚀 Instalación local

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/ecommerce-app.git
cd ecommerce-app
npm install
```

### 2. Configura las variables de entorno

Copia `.env.example` y completa los valores:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configura Supabase

- Crea un proyecto en [supabase.com](https://supabase.com)
- Ejecuta las migraciones SQL para crear las tablas: `profiles`, `categories`, `products`, `orders`, `order_items`
- Crea un bucket de Storage llamado `products` (público, 5 MB, tipos: image/jpeg, image/png, image/webp)
- En **Auth → Settings**, desactiva "Enable email confirmations" para desarrollo

### 4. Configura Stripe

- Crea un webhook en el [dashboard de Stripe](https://dashboard.stripe.com/webhooks) apuntando a `https://tu-dominio.com/api/webhooks/stripe`
- Evento a escuchar: `payment_intent.succeeded`
- Para desarrollo local usa [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Inicia el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (store)/       # Tienda pública (/, /products, /cart, /checkout, /orders)
│   ├── (admin)/       # Panel admin (/admin/dashboard, /products, /orders...)
│   ├── (auth)/        # Auth (/login, /register, /forgot-password)
│   └── api/           # API routes (checkout, webhooks, productos, categorías)
├── components/
│   ├── admin/         # Sidebar, ProductForm, CategoryManager
│   ├── shared/        # Navbar, ThemeToggle, ThemeProvider
│   └── store/         # ProductCard, ProductList, AddToCartButton
├── hooks/             # useCart (Zustand), useUser
├── lib/
│   ├── supabase/      # Clientes server, browser y admin
│   ├── stripe/        # Cliente Stripe
│   ├── resend/        # Cliente y templates de email
│   └── validations/   # Schemas Zod
└── types/             # Tipos TypeScript del schema de la BD
```

## 💳 Tarjeta de prueba (Stripe)

```
Número:  4242 4242 4242 4242
Fecha:   Cualquier fecha futura
CVV:     Cualquier 3 dígitos
```

## 🔐 Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SECRET_KEY` | Service role key (solo servidor) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe |
| `RESEND_API_KEY` | API key de Resend para emails |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (para emails) |

## 📜 Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Iniciar build de producción
npm run lint     # Ejecutar ESLint
```

---

Hecho usando Next.js y Supabase.
