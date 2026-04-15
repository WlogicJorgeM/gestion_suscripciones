# Davivienda — Sistema de Gestión de Suscripciones

Sistema web para gestionar clientes, planes de suscripción y facturación recurrente con control de estados de cuenta, vencimientos y generación de reportes de ingresos.

## Arquitectura Hexagonal (Ports & Adapters)

```
backend/
├── src/
│   ├── domain/          ← Core: Entidades, Enums, Puertos, Strategies (sin dependencias)
│   ├── application/     ← Casos de Uso: CreateSubscription, ProcessPayment, GenerateReport, CheckExpirations
│   └── infrastructure/  ← Adaptadores: Prisma, Controllers REST, JWT Auth, Guards, DTOs
frontend/
├── src/
│   ├── app/
│   │   ├── core/        ← Guards, Interceptors, Services, Models
│   │   ├── features/    ← auth/, dashboard/, client-portal/
│   │   └── shared/      ← lib/ (StatusBadge, KpiCard, CopCurrencyPipe)
```

## ¿Por qué Arquitectura Hexagonal?

El dominio define interfaces (puertos) que la infraestructura implementa (adaptadores). Para cambiar de PostgreSQL a otro motor, basta crear nuevos repositorios que implementen los mismos puertos, sin modificar dominio ni casos de uso.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS, Prisma ORM, PostgreSQL (puerto 5433), JWT, bcrypt |
| Frontend | Angular 17+, PrimeNG 17, SCSS por componente |
| Testing | Jest (22 tests: strategies, factory, fechas de suscripción) |

## Patrones de Diseño

- **Strategy Pattern**: `BillingStrategy` → `BronceStrategy` (0%), `PlataStrategy` (10%), `OroStrategy` (25% descuento). Cada strategy calcula: descuento → subtotal → IVA 19% → total.
- **Factory Pattern**: `BillingStrategyFactory.create(planType)` instancia la strategy correcta.
- **Repository Pattern**: Puertos en `domain/ports/`, implementaciones Prisma en `infrastructure/repositories/`.

## Principios SOLID Aplicados

- **S**: Cada archivo tiene una responsabilidad (entidad, puerto, caso de uso, controlador).
- **O**: Nuevo plan = nueva Strategy + registro en Factory, sin modificar código existente.
- **L**: Todas las strategies implementan `BillingStrategy`, todos los repos implementan su puerto.
- **I**: Puertos definen solo métodos necesarios para cada contexto.
- **D**: Casos de uso dependen de interfaces (`@Inject(SYMBOL)`), no de Prisma directamente.

## Funcionalidades

### Autenticación y Roles
- JWT con roles ADMIN/CLIENT en el payload
- Guards: `JwtAuthGuard`, `RolesGuard`, `ActiveSubscriptionGuard`
- Register con selector de rol, Login con redirección automática según rol

### Gestión de Planes (CRUD) — Solo ADMIN
- Crear planes Bronce ($50,000), Plata ($120,000), Oro ($250,000)
- Asignar plan a cliente con fechas inicio/fin automáticas
- Cambiar plan (cancela actual, crea nueva suscripción)

### Motor de Facturación
- Cálculo automático según plan (Strategy Pattern): base → descuento → subtotal → IVA → total
- Prefactura (PENDING) → Pago (PAID, suma a ingresos) → Vencida (OVERDUE)
- Verificación automática de vencimientos al iniciar el servidor y cada 60 minutos

### Control de Acceso
- Cliente con suscripción vencida ve overlay de bloqueo en el portal
- Cliente puede pagar facturas pendientes/vencidas desde su portal (PUT /invoices/:id/pay)
- Admin gestiona todo desde el panel administrativo

### Reportes
- KPIs: Total clientes, activos, vencidos, recaudación total (COP)
- Gráficos: Doughnut (activos vs vencidos), Barras (distribución por estado)
- Resumen de facturas: pagadas, pendientes, vencidas

## Verbos HTTP

| Verbo | Uso |
|-------|-----|
| GET | Consultar datos |
| POST | Crear recursos, login, register, procesar pago |
| PUT | Actualizar estado de suscripción, marcar factura pagada/vencida |
| DELETE | Eliminar plan |

## Pruebas Unitarias (22 tests)

```bash
cd backend
npx jest --forceExit
```

Cobertura:
- Strategies: Cálculo de descuento, IVA y total para Bronce, Plata, Oro
- Factory: Instanciación correcta y error para tipo inválido
- Fechas: endDate se calcula según durationDays del plan (30, 60, 90 días)
- Validaciones: Usuario no existe, plan no existe, suscripción activa duplicada

## Inicio Rápido

### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npx ng serve --port 4200
```

### Usuarios de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@davivienda.com | Admin123! |
| CLIENT | carlos.gomez@gmail.com | Client123! |

## Variables de Entorno

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/davivienda_subs"
JWT_SECRET="davivienda-jwt-secret-2024"
JWT_EXPIRES_IN="24h"
```

## Colección Postman

Importar `davivienda_api.postman_collection.json` — 35 requests organizados en 7 carpetas con scripts de test automáticos que guardan tokens y IDs.

## Poblar la Base de Datos (Seed)

El archivo `backend/seed.js` pobla todas las tablas con datos de prueba consumiendo la API REST directamente. Esto garantiza que los passwords se hasheen con bcrypt y que las facturas se calculen con el motor de facturación (Strategy Pattern).

### Prerrequisitos
1. PostgreSQL corriendo en el puerto 5433
2. Migraciones aplicadas (`npx prisma migrate dev`)
3. Backend corriendo (`npm run start:dev`)

### Ejecutar el seed
```bash
cd backend
node seed.js
```

### Qué crea el seed

| Tabla | Registros | Detalle |
|-------|-----------|---------|
| **users** | 11 | 1 Admin (Jorge Administrador) + 10 Clientes (Carlos Gómez, María López, etc.) |
| **plans** | 3 | Bronce ($50,000/30 días), Plata ($120,000/60 días), Oro ($250,000/90 días) |
| **subscriptions** | 10 | 4 Bronce + 3 Plata + 3 Oro → 7 Activas, 2 Vencidas, 1 Cancelada |
| **invoices** | 15 | 10 base + 5 extra → 6 Pagadas, 6 Pendientes, 3 Vencidas |

### Flujo del seed paso a paso
1. Registra el usuario admin con rol `ADMIN` vía `POST /auth/register`
2. Registra 10 clientes con rol `CLIENT` (password: `Client123!`)
3. Crea los 3 planes (Bronce, Plata, Oro) vía `POST /plans` con token admin
4. Asigna un plan a cada cliente vía `POST /subscriptions` (fechas automáticas)
5. Genera facturas para cada suscripción vía `POST /subscriptions/payment` (motor de facturación calcula automáticamente base → descuento → IVA → total)
6. Marca 6 facturas como PAID, 3 como OVERDUE
7. Cambia estado de 2 suscripciones a EXPIRED y 1 a CANCELLED
8. Imprime reporte final con métricas

### Limpiar y repoblar
Si necesitas reiniciar los datos:
```bash
# Desde psql conectado a la base
TRUNCATE invoices, subscriptions, plans, users CASCADE;
```
Luego ejecuta `node seed.js` nuevamente con el backend corriendo.

---

## Diagrama de Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Angular 17)                          │
│                         http://localhost:4200                            │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Login /  │  │  Dashboard   │  │ Client Portal │  │   Shared Lib  │  │
│  │ Register  │  │   (Admin)    │  │   (Cliente)   │  │  KPI, Badge,  │  │
│  │ (Roles)   │  │ KPIs,Tablas, │  │ Plan,Facturas │  │  COP Pipe     │  │
│  └─────┬─────┘  │ Gráficos,   │  │ Pago online   │  └───────────────┘  │
│        │        │ Facturación  │  └───────┬───────┘                     │
│        │        └──────┬───────┘          │                             │
│  ┌─────┴────────────────┴──────────────────┴──────┐                     │
│  │          AuthInterceptor (JWT Bearer)          │                     │
│  │          AuthGuard / RoleGuard / SubGuard      │                     │
│  └────────────────────┬───────────────────────────┘                     │
└───────────────────────┼─────────────────────────────────────────────────┘
                        │ HTTP (GET, POST, PUT, DELETE)
                        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (NestJS)                                   │
│                      http://localhost:3000/api                             │
│                                                                           │
│  ┌─────────────────── INFRASTRUCTURE ───────────────────────────────────┐ │
│  │                                                                       │ │
│  │  Controllers          Auth              Repositories                  │ │
│  │  ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐        │ │
│  │  │ AuthCtrl     │   │ JwtStrategy  │   │ PrismaUserRepo     │        │ │
│  │  │ PlanCtrl     │   │ JwtAuthGuard │   │ PrismaPlanRepo     │        │ │
│  │  │ SubCtrl      │   │ RolesGuard   │   │ PrismaSubRepo      │        │ │
│  │  │ InvoiceCtrl  │   │ ActiveSubGrd │   │ PrismaInvoiceRepo  │        │ │
│  │  │ BillingCtrl  │   │ RolesDecorat │   └─────────┬──────────┘        │ │
│  │  │ ReportCtrl   │   └──────────────┘             │                   │ │
│  │  └──────┬───────┘                                │                   │ │
│  └─────────┼────────────────────────────────────────┼───────────────────┘ │
│            │                                        │                     │
│  ┌─────────┴──────── APPLICATION ───────────────────┤                     │
│  │                                                  │                     │
│  │  ┌─────────────────────┐  ┌──────────────────┐   │                     │
│  │  │ CreateSubscription  │  │ ProcessPayment   │   │                     │
│  │  │ GenerateReport      │  │ CheckExpirations │   │                     │
│  │  └─────────┬───────────┘  └────────┬─────────┘   │                     │
│  └────────────┼───────────────────────┼─────────────┘                     │
│               │                       │                                   │
│  ┌────────────┴──────── DOMAIN (Core) ┴─────────────────────────────────┐ │
│  │                                                                       │ │
│  │  Entities              Ports (Interfaces)       Strategies            │ │
│  │  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐   │ │
│  │  │ UserEntity   │    │ UserRepoPort      │    │ BillingStrategy  │   │ │
│  │  │ PlanEntity   │    │ PlanRepoPort      │    │ ┌──────────────┐ │   │ │
│  │  │ SubEntity    │    │ SubRepoPort       │    │ │BronceStrtgy  │ │   │ │
│  │  │ InvoiceEntity│    │ InvoiceRepoPort   │    │ │SilverStrategy│ │   │ │
│  │  └──────────────┘    └───────────────────┘    │ │GoldStrategy  │ │   │ │
│  │                                                │ └──────────────┘ │   │ │
│  │  Enums                 Factory                 │ BillingStrategy  │   │ │
│  │  ┌──────────────┐    ┌───────────────────┐    │    Factory       │   │ │
│  │  │ Role         │    │ BillingStrategy   │    └──────────────────┘   │ │
│  │  │ PlanType     │    │    Factory        │                           │ │
│  │  │ SubStatus    │    └───────────────────┘                           │ │
│  │  │ InvStatus    │                                                    │ │
│  │  └──────────────┘                                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────┐
│        PostgreSQL (puerto 5433)        │
│        Base: davivienda_subs           │
│                                        │
│  ┌──────────┐  ┌──────────────────┐   │
│  │  users   │  │  subscriptions   │   │
│  │  plans   │  │  invoices        │   │
│  └──────────┘  └──────────────────┘   │
└───────────────────────────────────────┘
```

### Flujo de Facturación (Strategy Pattern)

```
Admin genera prefactura
        │
        ▼
┌─────────────────────────┐
│  ProcessPaymentUseCase  │
│                         │
│  1. Obtener suscripción │
│  2. Obtener plan        │
│  3. Factory.create()    │──► BillingStrategyFactory
│  4. strategy.calculate()│         │
│  5. Crear Invoice       │         ├── BronceStrategy (0% desc)
│     status: PENDING     │         ├── SilverStrategy (10% desc)
└────────┬────────────────┘         └── GoldStrategy (25% desc)
         │
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Invoice PENDING    │────►│  Cliente paga (PUT)  │
│  (Prefactura)       │     │  → Invoice PAID      │
└─────────────────────┘     │  → Suma a ingresos   │
         │                  └─────────────────────┘
         ▼ (si vence dueDate)
┌─────────────────────┐
│  Invoice OVERDUE    │
│  (CheckExpirations) │
└─────────────────────┘
```

---

## AI Assisted Development

Este proyecto fue desarrollado en una sesión intensiva de 6 horas utilizando **Kiro** (IDE con IA integrada) como copiloto de desarrollo. A continuación se documenta el proceso, las habilidades de prompting utilizadas y los prompts más complejos que resolvieron problemas técnicos reales.

### Herramientas de IA Utilizadas

| Herramienta | Uso |
|-------------|-----|
| **Kiro IDE** | IDE principal con agente de IA integrado para generación de código, debugging y refactoring |
| **Steering Files** | Reglas de desarrollo en `.kiro/steering/coding-standards.md` que guían al agente en cada interacción |
| **Hooks** | Automatización de tareas (verificación de vencimientos al iniciar servidor) |

### Skills de Prompting Aplicadas

#### 1. Scaffolding Arquitectónico — Generación de Estructura Base

> *"Generar la estructura base del proyecto siguiendo Arquitectura Hexagonal con tres capas: domain (entidades, enums, puertos, strategies sin dependencias externas), application (casos de uso con inyección de dependencias por interfaz) e infrastructure (controladores REST, repositorios Prisma, autenticación JWT con roles). El backend debe usar NestJS con Prisma ORM apuntando a PostgreSQL. El frontend Angular 17+ standalone con PrimeNG. Implementar Strategy Pattern para el motor de facturación con interfaz BillingStrategy y tres implementaciones concretas (BronceStrategy 0%, PlataStrategy 10%, OroStrategy 25% descuento), más un BillingStrategyFactory que instancie la correcta según PlanType."*

**Resultado**: Estructura completa del proyecto (45+ archivos backend, 20+ frontend) con arquitectura hexagonal, patrones de diseño y separación de capas generada en una sola iteración.

#### 2. Configuración de Infraestructura — Instancia PostgreSQL en Puerto Alterno

> *"Crear una segunda instancia de PostgreSQL en el puerto 5433 utilizando la instalación existente en el equipo (PostgreSQL 18, Windows). Ejecutar initdb para un nuevo cluster de datos, modificar postgresql.conf para el puerto 5433, iniciar el servicio, crear la base de datos davivienda_subs con usuario postgres/postgres, y ejecutar npx prisma migrate dev para aplicar el schema."*

**Resultado**: Instancia PostgreSQL independiente corriendo en puerto 5433 con la base de datos creada y migraciones aplicadas automáticamente.

#### 3. Diagnóstico de Compilación — Resolución de Archivo con 0 Bytes

> *"Diagnosticar el error de compilación del frontend en el módulo client-portal. Verificar el tamaño en disco del archivo TypeScript del componente, identificar la causa raíz del fallo de resolución del módulo, y aplicar un workaround de escritura vía Node.js si el filesystem no persiste el contenido correctamente."*

**Resultado**: Se identificó que `client-portal.component.ts` tenía 0 bytes en disco por un problema de persistencia del IDE. Se generó el archivo con Node.js como workaround y la compilación se resolvió.

#### 4. Corrección de Permisos y Estandarización de Verbos HTTP

> *"Corregir el error 403 Forbidden en PUT /invoices/:id/pay para usuarios con rol CLIENT. Eliminar la restricción @Roles(ADMIN) del endpoint de pago para que tanto admin como cliente puedan pagar facturas. Estandarizar todos los controladores del backend para usar exclusivamente GET, POST, PUT y DELETE (eliminar cualquier uso de PATCH). Propagar los cambios al API service del frontend (http.patch → http.put) y actualizar la colección Postman en el mismo archivo JSON sin recrearlo."*

**Resultado**: Controladores corregidos, frontend actualizado y colección Postman sincronizada. El cliente puede pagar facturas sin error 403.

#### 5. Implementación de Módulos UI con Requisitos Funcionales

> *"Implementar dos módulos frontend conectados al backend existente. Módulo 1 — Dashboard Administrativo: KPI cards semafóricos, tabla CRUD de suscripciones con filtros por estado y búsqueda por nombre, sección de facturación con cards de tarifas automáticas por plan mostrando desglose (base → descuento → subtotal → IVA 19% → total en COP). Módulo 2 — Portal Cliente: banner de estado de suscripción, overlay de bloqueo con contenido difuminado si la suscripción está vencida, tabla de facturas con botón de pago que ejecute PUT /invoices/:id/pay y actualice la vista en tiempo real."*

**Resultado**: Dos módulos completos con componentes PrimeNG, grids CSS fijos para desktop, overlay de bloqueo funcional y botón de pago conectado al backend con actualización reactiva.

#### 6. Refactoring de Estilos — Migración CSS Global a SCSS por Componente

> *"Migrar el frontend de un archivo CSS global a SCSS encapsulado por componente Angular. Configurar angular.json para soportar SCSS con stylePreprocessorOptions. Crear archivos .scss individuales para navbar, login, register, dashboard, client-portal y kpi-card. Mover los estilos específicos de cada componente a su .scss respectivo con :host { display: block }. Reducir styles.scss global a únicamente overrides de PrimeNG que no se pueden encapsular (datatable headers, paginator, dialog headers, tags)."*

**Resultado**: Frontend reestructurado con SCSS encapsulado por componente, eliminando conflictos de estilos globales. Cada componente con su `.ts` + `.html` + `.scss` separados.

#### 7. Definición de Reglas de Código — Steering Files

> *"Crear un archivo de steering en .kiro/steering/coding-standards.md con inclusion: always que defina las reglas del proyecto: tipado estricto sin any, manejo de errores con excepciones NestJS, principios SOLID aplicados a la arquitectura hexagonal (S: un archivo una responsabilidad, O: nuevas strategies sin modificar existentes, D: inyección por interfaz), patrones Strategy/Factory/Repository documentados, y cobertura mínima de tests unitarios para strategies de facturación, factory y validación de fechas de suscripción."*

**Resultado**: Archivo de steering persistente que se aplica automáticamente en cada interacción, asegurando consistencia en todo el código generado.

### Métricas del Desarrollo Asistido

| Métrica | Valor |
|---------|-------|
| Archivos generados | 65+ |
| Líneas de código (estimado) | ~4,500 |
| Tests unitarios | 22 (100% passing) |
| Endpoints API | 18 |
| Requests Postman | 35 |
| Iteraciones de diseño UI | 8 |
| Bugs resueltos en sesión | 12 (403, 0-byte files, PATCH→PUT, menu popup, etc.) |
| Tiempo total | ~6 horas |
