# Scripts de Base de Datos para JSensei

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos de JSensei, incluyendo el sistema de IA.

## 📁 Estructura de Scripts

```
src/scripts/
├── 000_setup_ai_system.sql          # Script maestro para configurar el sistema de IA
├── 001_create_database_schema.sql   # Esquema base de la base de datos
├── 002_seed_placement_questions.sql # Preguntas de prueba de nivelación
├── 003_modern_js_questions.sql      # Preguntas adicionales de JavaScript moderno
├── 004_create_ai_tables.sql         # Tablas para el sistema de IA
├── 005_update_users_table.sql       # Actualización de tabla de usuarios
├── 006_seed_ai_data.sql             # Datos de ejemplo para IA (opcional)
└── README.md                        # Esta documentación
```

## 🚀 Instalación Rápida

### Opción 1: Script Maestro (Recomendado)

```bash
# Ejecutar el script maestro que configura todo automáticamente
psql -h your-supabase-host -U postgres -d postgres -f 000_setup_ai_system.sql
```

### Opción 2: Instalación Manual

```bash
# 1. Crear esquema base
psql -h your-supabase-host -U postgres -d postgres -f 001_create_database_schema.sql

# 2. Insertar preguntas de nivelación
psql -h your-supabase-host -U postgres -d postgres -f 002_seed_placement_questions.sql

# 3. Insertar preguntas adicionales (opcional)
psql -h your-supabase-host -U postgres -d postgres -f 003_modern_js_questions.sql

# 4. Crear tablas de IA
psql -h your-supabase-host -U postgres -d postgres -f 004_create_ai_tables.sql

# 5. Actualizar tabla de usuarios
psql -h your-supabase-host -U postgres -d postgres -f 005_update_users_table.sql

# 6. Insertar datos de ejemplo (opcional)
psql -h your-supabase-host -U postgres -d postgres -f 006_seed_ai_data.sql
```

## 📋 Descripción de Scripts

### 000_setup_ai_system.sql

**Script maestro que configura todo el sistema de IA**

- Ejecuta todos los scripts necesarios en orden
- Verifica que la instalación sea correcta
- Muestra instrucciones post-instalación
- **Recomendado para instalación inicial**

### 001_create_database_schema.sql

**Esquema base de la aplicación**

- Tabla `users` - Perfiles de usuario
- Tabla `lessons` - Lecciones del curso
- Tabla `user_progress` - Progreso del usuario
- Tabla `placement_questions` - Preguntas de nivelación
- Tabla `placement_responses` - Respuestas de usuarios
- Políticas RLS y triggers

### 002_seed_placement_questions.sql

**Preguntas de prueba de nivelación**

- 20+ preguntas de JavaScript básico e intermedio
- Diferentes niveles de dificultad
- Temas: variables, funciones, arrays, objetos, etc.

### 003_modern_js_questions.sql

**Preguntas de JavaScript moderno**

- Preguntas sobre ES6+ y características modernas
- Temas: async/await, destructuring, modules, etc.
- Complementa las preguntas básicas

### 004_create_ai_tables.sql

**Tablas del sistema de IA**

- `placement_analysis` - Análisis de pruebas de nivelación
- `learning_paths` - Planes de aprendizaje personalizados
- `generated_content` - Contenido generado por IA
- `generated_exercises` - Ejercicios generados por IA
- `exercise_evaluations` - Evaluaciones con IA
- `adaptive_progress` - Progreso adaptativo
- `ai_user_settings` - Configuraciones de IA por usuario
- `ai_usage_logs` - Logs de uso de IA

### 005_update_users_table.sql

**Actualización de tabla de usuarios**

- Campos adicionales para el sistema de IA
- Funciones para estadísticas de uso
- Triggers para actualización automática
- Vistas para análisis de datos

### 006_seed_ai_data.sql

**Datos de ejemplo para IA (Opcional)**

- Configuraciones de IA de ejemplo
- Logs de uso simulados
- Progreso adaptativo de ejemplo
- **Solo para desarrollo y pruebas**

## 🔧 Configuración Post-Instalación

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Requerido para IA)
OPENAI_API_KEY=your_openai_api_key
```

### 2. Verificar Instalación

```sql
-- Verificar que las tablas existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%ai%';

-- Verificar funciones
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%ai%';

-- Verificar triggers
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND trigger_name LIKE '%ai%';
```

## 📊 Funciones Útiles

### Estadísticas de Usuario

```sql
-- Obtener estadísticas de IA de un usuario
SELECT * FROM get_user_ai_stats('user-uuid-here');

-- Obtener progreso de aprendizaje
SELECT * FROM get_user_learning_progress('user-uuid-here');

-- Ver estadísticas generales
SELECT * FROM ai_usage_stats;
```

### Limpieza de Datos

```sql
-- Limpiar datos de IA de un usuario (GDPR)
SELECT cleanup_user_ai_data('user-uuid-here');

-- Limpiar logs antiguos
SELECT cleanup_old_ai_logs();

-- Limpiar datos de prueba
SELECT cleanup_test_ai_data();
```

## 🛠️ Mantenimiento

### Limpieza Regular

```sql
-- Ejecutar limpieza de logs antiguos (recomendado: semanal)
SELECT cleanup_old_ai_logs();
```

### Monitoreo de Uso

```sql
-- Ver uso de IA por usuario
SELECT
  u.display_name,
  u.total_ai_tokens_used,
  u.ai_usage_count,
  u.last_ai_interaction
FROM users u
WHERE u.ai_enabled = true
ORDER BY u.total_ai_tokens_used DESC;

-- Ver logs de errores
SELECT * FROM ai_usage_logs
WHERE success = false
ORDER BY created_at DESC;
```

## 🔒 Seguridad

### Row Level Security (RLS)

- Todas las tablas tienen RLS habilitado
- Los usuarios solo pueden acceder a sus propios datos
- Las tablas públicas (preguntas) son de solo lectura

### Políticas de Privacidad

- Función `cleanup_user_ai_data()` para cumplir con GDPR
- Logs de uso para auditoría
- Configuraciones de privacidad por usuario

## 🐛 Troubleshooting

### Error: "Tabla no existe"

```bash
# Verificar que ejecutaste los scripts en orden
psql -h your-host -U postgres -d postgres -c "\dt public.*ai*"
```

### Error: "Función no existe"

```bash
# Verificar funciones
psql -h your-host -U postgres -d postgres -c "\df public.*ai*"
```

### Error: "Permisos insuficientes"

```bash
# Verificar que tienes permisos de superusuario
psql -h your-host -U postgres -d postgres -c "SELECT current_user, session_user;"
```

## 📈 Monitoreo y Métricas

### Dashboard de Uso de IA

```sql
-- Crear vista para dashboard
CREATE VIEW ai_dashboard AS
SELECT
  DATE(created_at) as fecha,
  service_type,
  COUNT(*) as total_requests,
  SUM(tokens_used) as total_tokens,
  AVG(processing_time) as avg_processing_time,
  SUM(cost_estimate) as total_cost
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), service_type
ORDER BY fecha DESC;
```

### Alertas de Costo

```sql
-- Usuarios con alto uso de tokens
SELECT
  u.display_name,
  u.email,
  u.total_ai_tokens_used,
  u.ai_usage_count
FROM users u
WHERE u.total_ai_tokens_used > 100000 -- Ajustar según necesidades
ORDER BY u.total_ai_tokens_used DESC;
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de OpenAI](https://platform.openai.com/docs)
- [Guía de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentación del sistema de IA](./../lib/ai/README.md)

## 🤝 Contribución

Si necesitas agregar nuevas tablas o funcionalidades:

1. Crea un nuevo script numerado (ej: `007_new_feature.sql`)
2. Actualiza este README
3. Agrega el script al script maestro si es necesario
4. Incluye tests y documentación

## 📞 Soporte

Si tienes problemas con la instalación:

1. Verifica que ejecutaste los scripts en orden
2. Revisa los logs de PostgreSQL
3. Consulta la documentación de Supabase
4. Revisa los ejemplos en `src/lib/ai/example-usage.ts`
