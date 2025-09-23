-- ========================================
-- JSENSEI - SETUP MAESTRO
-- ========================================
-- Script principal para configurar completamente el sistema JSensei
-- Versión: 2.1 - Estructura ultra-optimizada (SIN user_profiles)
-- 
-- INSTRUCCIONES:
-- 1. Asegúrate de tener una base de datos PostgreSQL limpia
-- 2. Configura Supabase Auth si usas Supabase
-- 3. Ejecuta este script completo
-- 4. Configura las variables de entorno necesarias

-- ========================================
-- INFORMACIÓN DEL SISTEMA
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚀 CONFIGURANDO JSENSEI v2.1';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📚 Sistema de Tutoría Inteligente para JavaScript';
  RAISE NOTICE '🤖 Con generación de contenido por IA';
  RAISE NOTICE '📊 Aprendizaje adaptativo personalizado';
  RAISE NOTICE '';
  RAISE NOTICE '⏱️  Tiempo estimado: 2-3 minutos';
  RAISE NOTICE '🔧 Creando estructura ultra-optimizada (7 tablas)...';
  RAISE NOTICE '';
END $$;

-- ========================================
-- PASO 1: VERIFICAR PRERREQUISITOS
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '🔍 PASO 1: Verificando prerrequisitos...';
  
  -- Verificar que estamos en PostgreSQL
  IF version() NOT LIKE '%PostgreSQL%' THEN
    RAISE EXCEPTION 'Este script requiere PostgreSQL';
  END IF;
  
  -- Verificar extensiones necesarias
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    RAISE NOTICE '  ✅ Extensión uuid-ossp habilitada';
  END IF;
  
  -- Verificar que existe el esquema auth (para Supabase)
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    RAISE NOTICE '  ⚠️  Esquema auth no encontrado - creando esquema básico';
    CREATE SCHEMA IF NOT EXISTS auth;
    
    -- Crear tabla básica de usuarios para auth si no existe
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      raw_user_meta_data JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    RAISE NOTICE '  ✅ Esquema auth encontrado';
  END IF;
  
  -- Crear función auth.uid() si no existe (para compatibilidad)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'uid' AND routine_schema = 'auth'
  ) THEN
    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS UUID
    LANGUAGE sql
    STABLE
    AS $$
      SELECT COALESCE(
        current_setting('request.jwt.claim.sub', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
      )::uuid;
    $$;
    RAISE NOTICE '  ✅ Función auth.uid() creada';
  END IF;
  
  -- Crear función auth.role() si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'role' AND routine_schema = 'auth'
  ) THEN
    CREATE OR REPLACE FUNCTION auth.role()
    RETURNS TEXT
    LANGUAGE sql
    STABLE
    AS $$
      SELECT COALESCE(
        current_setting('request.jwt.claim.role', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
      )::text;
    $$;
    RAISE NOTICE '  ✅ Función auth.role() creada';
  END IF;
  
  RAISE NOTICE '✅ Prerrequisitos verificados';
END $$;

-- ========================================
-- PASO 2: CREAR ESTRUCTURA CORE
-- ========================================

\echo '🏗️  PASO 2: Creando estructura core...'
\i 001_create_core_schema.sql

-- ========================================
-- PASO 3: INSERTAR DATOS INICIALES
-- ========================================

\echo '📊 PASO 3: Insertando datos iniciales...'
\i 002_seed_initial_data.sql

-- ========================================
-- PASO 4: VERIFICAR INSTALACIÓN
-- ========================================

\echo '🔍 PASO 4: Verificando instalación...'
\i 004_verification_and_setup.sql

-- ========================================
-- PASO 5: CONFIGURACIÓN FINAL
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  PASO 5: Configuración final...';
  
  -- Crear usuario administrador de ejemplo (opcional)
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@jsensei.com',
    '{"display_name": "Administrador JSensei", "role": "admin"}'
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Actualizar configuración del sistema
  UPDATE public.system_config 
  SET value = jsonb_set(value, '{setup_completed}', 'true'::jsonb)
  WHERE key = 'ai_generation_config';
  
  INSERT INTO public.system_config (key, value, description) VALUES
  ('setup_info', jsonb_build_object(
    'version', '2.1',
    'setup_date', NOW(),
    'database_optimized', true,
    'tables_count', 7,
    'features', jsonb_build_array(
      'placement_tests',
      'ai_content_generation',
      'adaptive_learning',
      'progress_tracking',
      'personalized_paths',
      'unified_user_table'
    )
  ), 'Información de configuración del sistema')
  ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Configuración final completada';
END $$;

-- ========================================
-- RESUMEN FINAL
-- ========================================

DO $$
DECLARE
  setup_info JSONB;
  total_tables INTEGER;
  total_functions INTEGER;
  total_views INTEGER;
  total_indexes INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡CONFIGURACIÓN DE JSENSEI COMPLETADA!';
  RAISE NOTICE '========================================';
  
  -- Obtener estadísticas de la instalación
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO total_functions
  FROM information_schema.routines 
  WHERE routine_schema = 'public';
  
  SELECT COUNT(*) INTO total_views
  FROM information_schema.views 
  WHERE table_schema = 'public';
  
  SELECT COUNT(*) INTO total_indexes
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '📊 ESTADÍSTICAS DE INSTALACIÓN:';
  RAISE NOTICE '  📋 Tablas creadas: %', total_tables;
  RAISE NOTICE '  ⚙️  Funciones creadas: %', total_functions;
  RAISE NOTICE '  👁️  Vistas creadas: %', total_views;
  RAISE NOTICE '  🚀 Índices creados: %', total_indexes;
  RAISE NOTICE '';
  
  RAISE NOTICE '🔧 CARACTERÍSTICAS PRINCIPALES:';
  RAISE NOTICE '  ✅ Estructura de base de datos ultra-optimizada (7 tablas core)';
  RAISE NOTICE '  ✅ Tabla de usuarios unificada (sin user_profiles)';
  RAISE NOTICE '  ✅ Sistema de exámenes de nivelación';
  RAISE NOTICE '  ✅ Generación de contenido con IA';
  RAISE NOTICE '  ✅ Learning paths personalizados';
  RAISE NOTICE '  ✅ Progreso adaptativo';
  RAISE NOTICE '  ✅ Seguridad con Row Level Security (RLS)';
  RAISE NOTICE '  ✅ Funciones de análisis y estadísticas';
  RAISE NOTICE '  ✅ Sistema de migración incluido';
  RAISE NOTICE '';
  
  RAISE NOTICE '📋 PRÓXIMOS PASOS:';
  RAISE NOTICE '  1. 🔑 Configurar OPENAI_API_KEY en tu archivo .env.local';
  RAISE NOTICE '  2. 🔄 Reiniciar tu servidor de desarrollo';
  RAISE NOTICE '  3. 🧪 Probar el registro de usuarios';
  RAISE NOTICE '  4. 📝 Verificar la generación de contenido con IA';
  RAISE NOTICE '  5. 📊 Revisar el dashboard de administración';
  RAISE NOTICE '';
  
  RAISE NOTICE '🔗 ENDPOINTS DE API DISPONIBLES:';
  RAISE NOTICE '  • POST /api/ai/generate-content';
  RAISE NOTICE '  • POST /api/ai/generate-learning-path';
  RAISE NOTICE '  • POST /api/ai/evaluate-exercise';
  RAISE NOTICE '  • GET  /api/user/stats';
  RAISE NOTICE '  • GET  /api/placement-test/questions';
  RAISE NOTICE '';
  
  RAISE NOTICE '📚 FUNCIONES ÚTILES CREADAS:';
  RAISE NOTICE '  • get_user_stats(user_id) - Estadísticas del usuario';
  RAISE NOTICE '  • get_learning_path_progress(path_id) - Progreso del path';
  RAISE NOTICE '  • cleanup_user_data(user_id) - Limpieza GDPR';
  RAISE NOTICE '';
  
  RAISE NOTICE '🛠️  HERRAMIENTAS DE MIGRACIÓN:';
  RAISE NOTICE '  • backup_old_structure() - Respaldar estructura antigua';
  RAISE NOTICE '  • migrate_old_data() - Migrar datos existentes';
  RAISE NOTICE '  • cleanup_old_structure() - Limpiar estructura antigua';
  RAISE NOTICE '';
  
  RAISE NOTICE '⚠️  RECORDATORIOS IMPORTANTES:';
  RAISE NOTICE '  • Configura las variables de entorno antes de usar IA';
  RAISE NOTICE '  • Revisa las políticas RLS según tus necesidades';
  RAISE NOTICE '  • Monitorea el uso de tokens de IA para controlar costos';
  RAISE NOTICE '  • Haz respaldos regulares de la base de datos';
  RAISE NOTICE '';
  
  RAISE NOTICE '🎯 ¡JSENSEI ESTÁ LISTO PARA ENSEÑAR JAVASCRIPT!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Guardar información de setup
  SELECT value INTO setup_info 
  FROM public.system_config 
  WHERE key = 'setup_info';
  
  RAISE NOTICE '📄 Configuración guardada en system_config';
  RAISE NOTICE '🕐 Completado el: %', (setup_info->>'setup_date');
END $$;

-- ========================================
-- MENSAJE FINAL
-- ========================================

SELECT
  '🎉 JSensei v2.1 Setup Complete!' as "¡Configuración Completada!",
  NOW() as "Fecha y Hora",
  'Sistema ultra-optimizado listo para tutoría inteligente de JavaScript' as "Estado",
  'Revisa los próximos pasos en el log anterior' as "Instrucciones";
