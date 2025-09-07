# JSensei - Sistema de Tutoría Inteligente para JavaScript (Básico e Intermedio)

## 🚀 Configuración del Sistema de Nivelación

### 1. Configuración de la Base de Datos

#### Paso 1: Ejecutar Scripts de Base de Datos

Ejecuta los scripts SQL en tu base de datos de Supabase en este orden:

1. **`src/scripts/001_create_database_schema.sql`** - Crea las tablas principales
2. **`src/scripts/002_seed_placement_questions.sql`** - Inserta las preguntas modernas de JavaScript

#### Paso 2: Poblar Base de Datos (Alternativo)

También puedes usar la interfaz web de administración:

1. Inicia el servidor: `pnpm dev`
2. Ve a: `http://localhost:3000/admin`
3. Haz clic en "Poblar Base de Datos"

### 2. Flujo del Usuario

#### Nuevo Usuario:

1. **Registro** → `/auth/register`
2. **Test de Nivelación** → `/placement-test` (automático)
3. **Dashboard Personalizado** → `/dashboard`

#### Usuario Existente:

1. **Login** → `/auth/login`
2. **Dashboard** → `/dashboard` (con contenido personalizado)

### 3. Características del Sistema

#### 🧠 Test de Nivelación Inteligente

- **26 preguntas** modernas de JavaScript (ES6+)
- **2 niveles**: Principiante, Intermedio
- **Evaluación automática** con algoritmo personalizado
- **Generación de contenido** basada en resultados

#### 📚 Contenido Personalizado

- **Rutas de aprendizaje** adaptadas al nivel
- **Lecciones dinámicas** generadas por IA
- **Ejercicios específicos** para áreas débiles
- **Progreso tracking** detallado

#### 🎯 Características Modernas

- **JavaScript ES6+**: Arrow functions, async/await, destructuring
- **Conceptos intermedios**: Promises, Modules, Closures básicas
- **Mejores prácticas**: Patrones modernos, manejo de errores
- **UI/UX moderna**: Interfaz intuitiva y responsiva

### 4. Estructura de Preguntas

#### Nivel Principiante (11 preguntas - 1 punto c/u)

- Variables modernas (`let`, `const`)
- Arrow functions
- Template literals
- Destructuring básico
- ES6 modules
- Conceptos fundamentales
- Arrays y objetos básicos
- Comparaciones (== vs ===)
- typeof y hoisting

#### Nivel Intermedio (15 preguntas - 2 puntos c/u)

- Async/await
- Promises básicas
- Spread operator
- Optional chaining
- Array methods modernos
- Conceptos de scope
- Closures básicas
- Manejo de errores
- JSON methods
- Métodos de array avanzados

### 5. Algoritmo de Evaluación

```javascript
// Lógica de nivelación para básico e intermedio
if (percentage >= 45) skillLevel = 'intermediate'
else skillLevel = 'beginner'

// Análisis de áreas débiles
- Identifica patrones en respuestas incorrectas
- Genera contenido específico para debilidades
- Adapta la dificultad del contenido futuro
```

### 6. Base de Datos

#### Tablas Principales:

- **`users`** - Información del usuario y nivel
- **`placement_questions`** - Preguntas del test
- **`placement_responses`** - Respuestas de los usuarios
- **`lessons`** - Lecciones generadas
- **`user_progress`** - Progreso del usuario

### 7. APIs Disponibles

#### `/api/admin/seed-database`

- **POST**: Poblar base de datos con preguntas
- **GET**: Verificar estado actual

### 8. Servicios Clave

#### `PlacementService`

```typescript
-evaluatePlacementTest() - // Evalúa respuestas
  generatePersonalizedLearningPath() - // Crea ruta personalizada
  completeUserPlacement(); // Completa proceso de nivelación
```

### 9. Próximos Pasos Recomendados

#### 🔄 Integración con IA Real

- Conectar con OpenAI/Anthropic para generación de contenido
- Implementar evaluación inteligente de respuestas
- Generar ejercicios adaptativos

#### 📊 Analytics y Mejoras

- Dashboard de analytics para administradores
- Métricas de aprendizaje
- A/B testing de contenido

#### 🎮 Gamificación

- Sistema de puntos y logros
- Streaks y desafíos diarios
- Competencias entre usuarios

### 10. Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Linting
pnpm lint

# Verificar tipos
npx tsc --noEmit
```

### 11. Estructura de Archivos Clave

```
src/
├── app/
│   ├── admin/page.tsx              # Panel de administración
│   ├── placement-test/page.tsx     # Test de nivelación
│   ├── dashboard/page.tsx          # Dashboard personalizado
│   └── api/admin/seed-database/    # API para poblar DB
├── lib/ai/
│   ├── placement-service.ts        # Servicio principal de nivelación
│   └── content-generator.ts        # Generador de contenido
└── scripts/
    ├── 001_create_database_schema.sql
    └── 002_seed_placement_questions.sql
```

## ✅ Sistema Completo y Funcional

El sistema JSensei está ahora completamente configurado para **niveles básico e intermedio** con:

- ✅ **Test de nivelación** con 26 preguntas modernas (11 básico + 15 intermedio)
- ✅ **Evaluación inteligente** y personalización para 2 niveles
- ✅ **Dashboard adaptativo** por nivel (Principiante/Intermedio)
- ✅ **Base de datos** completamente estructurada
- ✅ **APIs** para administración
- ✅ **UI/UX moderna** y responsiva
- ✅ **Contenido enfocado** en JavaScript moderno práctico

¡Listo para evaluar usuarios y generar contenido personalizado de JavaScript básico e intermedio! 🎉
