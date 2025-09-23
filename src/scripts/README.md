# Scripts de Base de Datos para JSensei v2.1

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos ultra-optimizada de JSensei, con estructura consolidada y mejorada.

## 🎯 Nueva Estructura Ultra-Optimizada (v2.1)

**¡IMPORTANTE!** Esta es la nueva estructura ultra-optimizada que reemplaza la anterior. La nueva versión reduce la complejidad de 15+ tablas a solo **7 tablas core**, mejorando significativamente el rendimiento y mantenibilidad.

### ✅ Nueva Funcionalidad: Identificador de Topics

**Problema Solucionado**: Ahora cada topic en `learning_paths` tiene un identificador único (`topic_id`) que permite:
- ✅ Buscar contenido específico de un topic
- ✅ Organizar content_items por topic
- ✅ Mostrar contenido cuando se hace click en un topic del dashboard

**Campos agregados:**
- `topic_id UUID` en `content_items` - Referencia al topic específico en el learning_path

**Campos eliminados:**
- `topic TEXT` en `content_items` - Ya no es necesario, el nombre del topic viene del JSONB en learning_paths

**Funciones disponibles:**
- `get_content_items_by_topic_id(uuid)` - Obtener content_items de un topic específico
- `get_learning_path_with_content(uuid, uuid)` - Obtener learning_path con todo su contenido organizado por topics
- `generate_content_items_from_learning_path(uuid, uuid)` - Generar automáticamente content_items desde un learning_path

### 🔍 Consultas Útiles para Topics

```sql
-- Obtener todos los topics de un learning_path con su contenido
SELECT * FROM public.get_learning_path_with_content(
  'uuid-del-learning-path'::UUID,
  'uuid-del-usuario'::UUID
);

-- Obtener contenido específico de un topic
SELECT * FROM public.get_content_items_by_topic_id(
  'uuid-del-topic'::UUID
);

-- Query manual para debugging
SELECT
  ci.id,
  ci.title,
  ci.topic,
  ci.topic_id,
  lp.title as learning_path_title
FROM public.content_items ci
JOIN public.learning_paths lp ON ci.learning_path_id = lp.id
WHERE ci.learning_path_id = 'uuid-del-learning-path'::UUID
ORDER BY ci.topic_id, ci.order_index;
```

### 💻 Ejemplo de Uso en TypeScript

```typescript
// En tu API route o componente
export async function getTopicContent(topicId: string, learningPathId: string, userId: string) {
  try {
    // 1. Obtener información del learning_path con todos sus topics
    const { data: learningPathData, error: lpError } = await supabase
      .rpc('get_learning_path_with_content', {
        p_learning_path_id: learningPathId,
        p_user_id: userId
      });

    if (lpError) throw lpError;

    // 2. Encontrar el topic específico
    const topic = learningPathData.find((t: any) => t.topic_id === topicId);

    if (!topic) {
      throw new Error('Topic not found');
    }

    // 3. Obtener content_items específicos del topic
    const { data: contentItems, error: contentError } = await supabase
      .rpc('get_content_items_by_topic_id', {
        p_topic_id: topicId
      });

    if (contentError) throw contentError;

    return {
      topic: topic.topic_name, // El nombre viene del JSONB del learning_path
      contentItems: contentItems || []
    };

  } catch (error) {
    console.error('Error fetching topic content:', error);
    throw error;
  }
}
```

**Flujo de trabajo:**
1. ✅ Usuario hace click en un topic del dashboard
2. ✅ Se llama a `getTopicContent(topicId, learningPathId, userId)`
3. ✅ Se obtienen todos los content_items asociados a ese topic_id
4. ✅ Se muestra el contenido al usuario

## 📁 Estructura de Scripts (Nueva)

```
src/scripts/
├── 000_setup_jsensei.sql           # 🚀 Script maestro - EJECUTAR ESTE
├── 001_create_core_schema.sql      # 🏗️  Estructura core ultra-optimizada (7 tablas)
├── 002_seed_initial_data.sql       # 📊 Datos iniciales y preguntas de nivelación
├── 003_migration_helper.sql        # 🔄 Herramientas de migración desde v1.0/v2.0
├── 004_verification_and_setup.sql  # ✅ Verificación y configuración final
└── README.md                       # 📚 Esta documentación
```

### 📁 Scripts Antiguos (Deprecados)

Los siguientes scripts son de la versión anterior y serán eliminados:

- `000_setup_ai_system.sql` ❌
- `003_modern_js_questions.sql` ❌
- `004_create_ai_tables.sql` ❌
- `005_update_users_table.sql` ❌
- `006_seed_ai_data.sql` ❌

## 🚀 Instalación Rápida (v2.0)

### ✅ Instalación Recomendada (Un Solo Comando)

```bash
# Ejecutar el script maestro que configura todo automáticamente
psql -h your-supabase-host -U postgres -d postgres -f 000_setup_jsensei.sql
```

**¡Eso es todo!** El script maestro se encarga de:
- ✅ Verificar prerrequisitos
- ✅ Crear estructura ultra-optimizada (7 tablas core)
- ✅ Inserción de datos iniciales
- ✅ Verificación de instalación
- ✅ Instrucciones post-instalación
- **Recomendado para instalación nueva**

### 🔄 Migración desde v1.0/v2.0

Si ya tienes datos en la estructura anterior:

```bash
# 1. Crear respaldo de datos existentes
psql -h your-host -U postgres -d postgres -c "SELECT public.backup_old_structure();"

# 2. Ejecutar migración
psql -h your-host -U postgres -d postgres -f 003_migration_helper.sql
psql -h your-host -U postgres -d postgres -c "SELECT public.migrate_old_data();"

# 3. Verificar migración
psql -h your-host -U postgres -d postgres -f 004_verification_and_setup.sql

# 4. Limpiar estructura antigua (opcional)
psql -h your-host -U postgres -d postgres -c "SELECT public.cleanup_old_structure();"
```

## 📋 Descripción de Scripts (v2.0)

### 000_setup_jsensei.sql ⭐

**Script maestro optimizado - EJECUTAR ESTE PRIMERO**

- ✅ Verificación automática de prerrequisitos
- ✅ Configuración completa en un solo comando
- ✅ Creación de estructura optimizada (8 tablas core)
- ✅ Inserción de datos iniciales
- ✅ Verificación de instalación
- ✅ Instrucciones post-instalación
- **Recomendado para instalación nueva**

### 001_create_core_schema.sql

**Estructura core ultra-optimizada (7 tablas)**

**Tablas principales:**
- `users` - **Información básica de usuarios** (solo campos esenciales)
- `placement_tests` - Exámenes de nivelación unificados
- `learning_paths` - Planes de aprendizaje personalizados
- `content_items` - Todo tipo de contenido (lecciones, ejercicios, etc.)
- `user_progress` - Progreso en learning paths
- `user_interactions` - Todas las interacciones del usuario
- `ai_sessions` - Logs consolidados de IA

**Mejoras v2.1:**
- ✅ **7 tablas** (vs 8 anteriores, vs 15+ en v1.0)
- ✅ **Eliminación completa** de tabla `user_profiles`
- ✅ **Tabla `users` simplificada** - Solo campos básicos del usuario
- ✅ **Configuraciones separadas** - Las preferencias se manejarán por otros medios
- ✅ **Estructura más simple** y mantenible

### 002_seed_initial_data.sql

**Datos iniciales y configuración**

- 📝 25+ preguntas de nivelación (básico, intermedio, avanzado)
- 📚 Contenido base de ejemplo
- ⚙️ Funciones útiles del sistema
- 👁️ Vistas para estadísticas
- 🔧 Configuración inicial del sistema

### 003_migration_helper.sql

**Herramientas de migración desde v1.0/v2.0**

- 💾 `backup_old_structure()` - Crear respaldos
- 🔄 `migrate_old_data()` - Migrar datos existentes
- ✅ Verificación automática de migración
- **Compatible con estructura unificada**

### 004_verification_and_setup.sql

**Verificación y configuración final**

- 🔍 Verificación completa de instalación
- 🧪 Pruebas funcionales automatizadas
- 🔒 Verificación de seguridad (RLS)
- 📊 Configuración del sistema
- 📈 Estadísticas finales

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

## 📊 Funciones Útiles (v2.0)

### 📈 Estadísticas de Usuario

```sql
-- Obtener estadísticas completas de un usuario
SELECT * FROM get_user_stats('user-uuid-here');

-- Obtener progreso de learning path específico
SELECT * FROM get_learning_path_progress('learning-path-uuid');

-- Ver estadísticas generales del sistema
SELECT * FROM system_stats;

-- Ver actividad reciente
SELECT * FROM recent_activity LIMIT 20;
```

### 🔧 Gestión de Datos

```sql
-- Limpiar todos los datos de un usuario (GDPR compliance)
SELECT cleanup_user_data('user-uuid-here');

-- Ver configuración del sistema
SELECT * FROM system_config;

-- Actualizar configuración
UPDATE system_config
SET value = '{"new": "config"}'::jsonb
WHERE key = 'ai_models';
```

### 🤖 Funciones de IA

```sql
-- Ver sesiones de IA de un usuario
SELECT * FROM ai_sessions
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- Estadísticas de uso de IA por servicio
SELECT
  service_type,
  COUNT(*) as total_requests,
  SUM(tokens_used) as total_tokens,
  AVG(cost_estimate) as avg_cost
FROM ai_sessions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY service_type;
```

## 🛠️ Mantenimiento (v2.0)

### 🧹 Limpieza Regular

```sql
-- Limpiar sesiones de IA antiguas (>30 días)
DELETE FROM ai_sessions
WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpiar interacciones antiguas (>90 días)
DELETE FROM user_interactions
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 📊 Monitoreo de Uso

```sql
-- Ver uso de IA por usuario (top 10)
SELECT
  u.display_name,
  up.total_ai_tokens_used,
  up.ai_usage_count,
  up.last_ai_interaction
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE up.ai_enabled = true
ORDER BY up.total_ai_tokens_used DESC
LIMIT 10;

-- Ver errores recientes de IA
SELECT * FROM ai_sessions
WHERE success = false
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Estadísticas de rendimiento
SELECT
  service_type,
  AVG(processing_time) as avg_time_ms,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = false) as errors
FROM ai_sessions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service_type;
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

## 🎯 Ventajas de la Nueva Estructura (v2.1)

### 📈 Mejoras de Rendimiento
- **70% menos tablas** (7 vs 10 anteriores, vs 15+ en v1.0)
- **Consultas ultra-rápidas** - Sin JOINs innecesarios
- **Tabla users simplificada** - Solo campos esenciales del usuario
- **Estructura ultra-ligera** y mantenible

### 🔧 Facilidad de Mantenimiento
- **Código más limpio** y organizado
- **Funciones consolidadas** en lugar de dispersas
- **Migración automática** desde v1.0 y v2.0
- **Documentación completa** y actualizada

### ⚠️ Consideraciones Importantes
- **Configuraciones de IA**: Se necesitará implementar un nuevo mecanismo para las preferencias de usuario
- **Estadísticas de IA**: Temporalmente desactivadas (función `update_ai_stats()` no actualiza nada)
- **Learning preferences**: Se manejarán por otros medios (localStorage, API, etc.)

### 🚀 Escalabilidad
- **Diseño ultra-flexible** para futuras características
- **Contenido unificado** en `content_items`
- **Interacciones consolidadas** en `user_interactions`
- **Configuración centralizada** en `system_config`

### 🔒 Seguridad Mejorada
- **RLS optimizado** con políticas más eficientes
- **Funciones GDPR** para limpieza de datos
- **Auditoría completa** de interacciones
- **Configuración granular** de permisos

## ⚠️ Funcionalidades Pendientes de Implementar

Con la eliminación de `user_profiles` y las columnas relacionadas, las siguientes funcionalidades necesitarán nueva implementación:

### 🤖 Configuraciones de IA del Usuario
```sql
-- Estas columnas ya no existen en users:
-- learning_style, difficulty_preference, ai_enabled, ai_model, ai_creativity, feedback_style
```
**Solución temporal**: Usar variables de entorno o configuración por defecto hasta implementar una nueva tabla o sistema de configuración.

### 📊 Estadísticas de IA
```sql
-- Estas columnas ya no existen en users:
-- total_ai_tokens_used, ai_usage_count, last_ai_interaction
```
**Estado actual**: La función `update_ai_stats()` está desactivada y no actualiza nada.
**Próximos pasos**: Implementar una nueva tabla `user_ai_stats` o integrar con servicios de analytics externos.

### 📚 Preferencias de Aprendizaje
**Estado actual**: Sin implementación en base de datos.
**Solución temporal**: Usar localStorage en el frontend o API endpoints para manejar estas preferencias.

```
src/scripts/
├── 000_setup_jsensei.sql           # 🚀 Script maestro (USAR ESTE)
├── 001_create_core_schema.sql      # 🏗️  7 tablas ultra-optimizadas
├── 002_seed_initial_data.sql       # 📊 Datos iniciales
├── 003_migration_helper.sql        # 🔄 Migración desde v1.0/v2.0
├── 004_verification_and_setup.sql  # ✅ Verificación final
├── deprecated_v1/                  # 📁 Scripts antiguos (no usar)
│   ├── 000_setup_ai_system.sql    # ❌ Deprecado
│   ├── 001_create_database_schema.sql # ❌ Deprecado
│   ├── 002_seed_placement_questions.sql # ❌ Deprecado
│   ├── 003_modern_js_questions.sql # ❌ Deprecado
│   ├── 004_create_ai_tables.sql   # ❌ Deprecado
│   ├── 005_update_users_table.sql # ❌ Deprecado
│   ├── 006_seed_ai_data.sql       # ❌ Deprecado
│   ├── 999_verify_installation.sql # ❌ Deprecado
│   └── README.md                   # 📚 Info sobre deprecados
└── README.md                       # 📚 Esta documentación
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de OpenAI](https://platform.openai.com/docs)
- [Guía de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contribución

Para agregar nuevas funcionalidades:

1. **Analiza la estructura actual** antes de agregar tablas
2. **Usa las tablas existentes** cuando sea posible (ej: `content_items` para nuevo contenido)
3. **Crea scripts numerados** (ej: `005_new_feature.sql`)
4. **Actualiza este README** con la nueva funcionalidad
5. **Incluye tests** en el script de verificación
6. **Documenta las funciones** con comentarios SQL

## 📞 Soporte y Troubleshooting

### 🆘 Problemas Comunes

**Error: "Tabla no existe"**

```bash
# Verificar que ejecutaste el script maestro
psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

**Error: "Función no existe"**

```bash
# Verificar funciones creadas
psql -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';"
```

**Error: "Permisos insuficientes"**

```bash
# Verificar permisos de usuario
psql -c "SELECT current_user, session_user;"
```

### 🔍 Verificación Rápida

```sql
-- Verificar que todo está funcionando
SELECT
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM placement_tests) as preguntas,
  (SELECT COUNT(*) FROM content_items) as contenido,
  (SELECT COUNT(*) FROM system_config) as configuracion;
```

### 📧 Contacto

Si necesitas ayuda adicional:

1. Revisa los logs de PostgreSQL
2. Consulta la documentación de Supabase
3. Verifica las variables de entorno
4. Ejecuta el script de verificación: `004_verification_and_setup.sql`
