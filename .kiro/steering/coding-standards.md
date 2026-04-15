---
inclusion: always
---

# Reglas de Desarrollo — Davivienda Suscripciones

## 1. Buenas Prácticas

### Código Limpio
- Nombres descriptivos en español para variables de negocio, inglés para código técnico
- Funciones cortas con responsabilidad única (máximo ~30 líneas)
- Sin comentarios obvios — el código debe ser autoexplicativo
- Comentarios JSDoc solo en interfaces públicas y puertos del dominio

### Tipado Estricto
- PROHIBIDO usar `any` — siempre tipar explícitamente
- Usar `strictNullChecks: true` — manejar null/undefined con operadores `??` y `?.`
- Interfaces para DTOs, entidades y respuestas de API
- Enums para valores fijos (roles, estados, tipos de plan)

### Manejo de Errores
- Backend: Usar excepciones de NestJS (`NotFoundException`, `ForbiddenException`, `ConflictException`)
- Nunca silenciar errores con `catch` vacío
- Frontend: Mostrar errores al usuario con `p-toast` de PrimeNG
- Logs en consola solo en desarrollo, nunca en producción

## 2. Principios SOLID y DRY

### Single Responsibility (S)
- Cada clase/archivo tiene UNA responsabilidad
- Separar: Entidades, Puertos, Casos de Uso, Repositorios, Controladores
- Un componente Angular = una vista específica

### Open/Closed (O)
- Nuevos tipos de plan se agregan creando una nueva Strategy, sin modificar las existentes
- Nuevos roles se agregan al enum `Role`, los guards se adaptan automáticamente

### Liskov Substitution (L)
- Todas las BillingStrategy implementan la misma interfaz `BillingStrategy`
- Todos los repositorios implementan su puerto (interfaz) del dominio

### Interface Segregation (I)
- Puertos del dominio definen solo los métodos necesarios
- No crear interfaces "god" con métodos que no todos los implementadores usan

### Dependency Inversion (D)
- El dominio NUNCA importa de infraestructura
- Los casos de uso dependen de interfaces (puertos), no de implementaciones (Prisma)
- Inyección de dependencias via `@Inject(SYMBOL)` de NestJS

### DRY
- Componentes reutilizables en `frontend/src/app/shared/lib/` (StatusBadge, KpiCard, CopCurrencyPipe)
- Lógica de facturación centralizada en Strategy Pattern, no duplicada en controladores
- Estilos compartidos en SCSS por componente, globales solo para PrimeNG overrides

## 3. Patrones de Diseño

### Strategy Pattern — Facturación
- Interfaz: `BillingStrategy` con método `calculate(basePrice: number): BillingResult`
- Implementaciones: `BronceStrategy` (0% desc), `PlataStrategy` (10% desc), `OroStrategy` (25% desc)
- Cada strategy calcula: descuento → subtotal → IVA 19% → total
- NUNCA hardcodear lógica de facturación fuera de las strategies

### Factory Pattern — Instanciación de Strategies
- `BillingStrategyFactory.create(planType)` retorna la strategy correcta
- Agregar nuevo plan = crear nueva Strategy + registrar en el Factory
- El Factory lanza error si el tipo de plan no existe

### Repository Pattern — Acceso a Datos
- Puertos (interfaces) en `domain/ports/` definen el contrato
- Implementaciones en `infrastructure/repositories/` usan Prisma
- Para cambiar de base de datos: crear nuevo repositorio que implemente el mismo puerto

### Hexagonal Architecture
```
domain/          ← Entidades, Enums, Puertos, Strategies (CERO dependencias externas)
application/     ← Casos de Uso (dependen solo del dominio)
infrastructure/  ← Prisma, Controllers, Auth, DTOs (implementan los puertos)
```

## 4. Pruebas Unitarias

### Cobertura Mínima Requerida
- **Strategies de facturación**: Validar cálculo de descuento, IVA y total para cada plan
- **Factory**: Validar que retorna la strategy correcta y lanza error para tipos inválidos
- **Validación de fechas**: Verificar que `endDate` se calcula correctamente según `durationDays`

### Estructura de Tests
- Archivo: `*.spec.ts` junto al archivo que testea
- Usar `describe` para agrupar por clase/función
- Usar `it` con descripción clara en español: `'debería calcular 10% de descuento para Silver'`
- Mocks para repositorios — nunca conectar a base de datos real en tests unitarios

### Qué NO testear
- Controladores (se prueban con Postman/e2e)
- Componentes Angular (se validan visualmente)
- Configuración de módulos NestJS

## 5. Frontend — Angular

### Estructura de Componentes
- Cada componente: `.ts` + `.html` + `.scss` (archivos separados, NUNCA inline)
- `templateUrl` y `styleUrl` en el decorador `@Component`
- Componentes standalone con imports explícitos

### PrimeNG
- Usar componentes PrimeNG para UI (p-table, p-dialog, p-dropdown, p-button, p-tag, etc.)
- Estilos globales de PrimeNG solo en `styles.scss`
- Estilos específicos en el `.scss` del componente (encapsulados por Angular)

### Signals
- Usar `signal()` para estado reactivo en componentes
- Usar `computed()` para valores derivados
- NO usar BehaviorSubject para estado de componentes

## 6. Backend — NestJS

### Controladores
- Solo GET, POST, PUT, DELETE (NO usar PATCH)
- Decoradores de validación en DTOs (`class-validator`)
- Guards para autenticación (`JwtAuthGuard`) y autorización (`RolesGuard`)

### Seguridad
- JWT con role en el payload
- Passwords hasheados con bcrypt (salt rounds: 10)
- CORS configurado solo para `http://localhost:4200`
- Variables sensibles en `.env`, nunca hardcodeadas
