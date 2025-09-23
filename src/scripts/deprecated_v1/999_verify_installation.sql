-- Script de verificación para el sistema de IA de JSensei
-- Ejecuta este script después de la instalación para verificar que todo funciona correctamente

-- ========================================
-- VERIFICACIÓN COMPLETA DEL SISTEMA DE IA
-- ========================================

DO $$
DECLARE
  verification_passed BOOLEAN := TRUE;
  error_messages TEXT[] := '{}';
  table_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
  index_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 Iniciando verificación del sistema de IA de JSensei...';
  RAISE NOTICE '';

  -- ========================================
  -- 1. VERIFICAR TABLAS REQUERIDAS
  -- ========================================
  
  RAISE NOTICE '📋 Verificando tablas...';
  
  -- Tablas base
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Tabla users no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Tabla users existe';
  END IF;

  -- Tablas de IA
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'placement_analysis' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Tabla placement_analysis no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Tabla placement_analysis existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_paths' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Tabla learning_paths no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Tabla learning_paths existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_content' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Tabla generated_content no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Tabla generated_content existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_usage_logs' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Tabla ai_usage_logs no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Tabla ai_usage_logs existe';
  END IF;

  -- Contar total de tablas de IA
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND (table_name LIKE '%ai%' 
       OR table_name IN ('placement_analysis', 'learning_paths', 'generated_content', 
                        'generated_exercises', 'exercise_evaluations', 'adaptive_progress', 
                        'ai_user_settings', 'ai_usage_logs'));

  RAISE NOTICE '📊 Total de tablas de IA: %', table_count;

  -- ========================================
  -- 2. VERIFICAR FUNCIONES REQUERIDAS
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Verificando funciones...';

  -- Funciones críticas
  IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_ai_usage_stats' AND routine_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Función update_ai_usage_stats no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Función update_ai_usage_stats existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_ai_stats' AND routine_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Función get_user_ai_stats no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Función get_user_ai_stats existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'cleanup_user_ai_data' AND routine_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Función cleanup_user_ai_data no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Función cleanup_user_ai_data existe';
  END IF;

  -- Contar total de funciones de IA
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name LIKE '%ai%';

  RAISE NOTICE '📊 Total de funciones de IA: %', function_count;

  -- ========================================
  -- 3. VERIFICAR TRIGGERS
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Verificando triggers...';

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_ai_usage_stats_trigger' AND event_object_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Trigger update_ai_usage_stats_trigger no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Trigger update_ai_usage_stats_trigger existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'create_default_ai_settings_trigger' AND event_object_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Trigger create_default_ai_settings_trigger no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Trigger create_default_ai_settings_trigger existe';
  END IF;

  -- Contar total de triggers de IA
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE event_object_schema = 'public' 
  AND trigger_name LIKE '%ai%';

  RAISE NOTICE '📊 Total de triggers de IA: %', trigger_count;

  -- ========================================
  -- 4. VERIFICAR ÍNDICES
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📇 Verificando índices...';

  -- Contar índices de IA
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND (indexname LIKE '%ai%' 
       OR tablename IN ('placement_analysis', 'learning_paths', 'generated_content', 
                       'generated_exercises', 'exercise_evaluations', 'adaptive_progress', 
                       'ai_user_settings', 'ai_usage_logs'));

  RAISE NOTICE '📊 Total de índices de IA: %', index_count;

  -- ========================================
  -- 5. VERIFICAR RLS (ROW LEVEL SECURITY)
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Verificando Row Level Security...';

  -- Verificar que RLS esté habilitado en tablas críticas
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'placement_analysis' AND relrowsecurity = true) THEN
    error_messages := array_append(error_messages, '❌ RLS no habilitado en placement_analysis');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ RLS habilitado en placement_analysis';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'generated_content' AND relrowsecurity = true) THEN
    error_messages := array_append(error_messages, '❌ RLS no habilitado en generated_content');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ RLS habilitado en generated_content';
  END IF;

  -- ========================================
  -- 6. VERIFICAR CAMPOS DE USUARIOS
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '👤 Verificando campos de usuarios...';

  -- Verificar campos de IA en tabla users
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ai_enabled' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Campo ai_enabled no existe en tabla users');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Campo ai_enabled existe en tabla users';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_ai_tokens_used' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Campo total_ai_tokens_used no existe en tabla users');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Campo total_ai_tokens_used existe en tabla users';
  END IF;

  -- ========================================
  -- 7. VERIFICAR VISTAS
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '👁️ Verificando vistas...';

  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'ai_usage_stats' AND table_schema = 'public') THEN
    error_messages := array_append(error_messages, '❌ Vista ai_usage_stats no existe');
    verification_passed := FALSE;
  ELSE
    RAISE NOTICE '✅ Vista ai_usage_stats existe';
  END IF;

  -- ========================================
  -- 8. RESULTADO FINAL
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
  IF verification_passed THEN
    RAISE NOTICE '🎉 ¡VERIFICACIÓN EXITOSA!';
    RAISE NOTICE '✅ El sistema de IA de JSensei está correctamente instalado';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMEN:';
    RAISE NOTICE '• Tablas de IA: %', table_count;
    RAISE NOTICE '• Funciones de IA: %', function_count;
    RAISE NOTICE '• Triggers de IA: %', trigger_count;
    RAISE NOTICE '• Índices de IA: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Configura OPENAI_API_KEY en tu archivo .env.local';
    RAISE NOTICE '2. Reinicia tu servidor de desarrollo';
    RAISE NOTICE '3. Prueba los endpoints en /api/ai/';
    RAISE NOTICE '4. Consulta src/lib/ai/README.md para ejemplos';
  ELSE
    RAISE NOTICE '❌ VERIFICACIÓN FALLIDA';
    RAISE NOTICE 'Se encontraron los siguientes errores:';
    RAISE NOTICE '';
    FOR i IN 1..array_length(error_messages, 1) LOOP
      RAISE NOTICE '%', error_messages[i];
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SOLUCIÓN:';
    RAISE NOTICE '1. Ejecuta el script 000_setup_ai_system.sql';
    RAISE NOTICE '2. Verifica que tienes permisos de superusuario';
    RAISE NOTICE '3. Revisa los logs de PostgreSQL para más detalles';
  END IF;
  
  RAISE NOTICE '========================================';

END $$;

-- ========================================
-- PRUEBAS FUNCIONALES
-- ========================================

-- Solo ejecutar si la verificación pasó
DO $$
DECLARE
  test_user_id UUID;
  test_result RECORD;
BEGIN
  -- Verificar que las funciones básicas funcionan
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_ai_stats' AND routine_schema = 'public') THEN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Ejecutando pruebas funcionales...';
    
    -- Crear un usuario de prueba si no existe
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
      -- Probar función de estadísticas
      BEGIN
        SELECT * INTO test_result FROM get_user_ai_stats(test_user_id);
        RAISE NOTICE '✅ Función get_user_ai_stats funciona correctamente';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Función get_user_ai_stats tiene problemas: %', SQLERRM;
      END;
      
      -- Probar función de progreso
      BEGIN
        SELECT * INTO test_result FROM get_user_learning_progress(test_user_id);
        RAISE NOTICE '✅ Función get_user_learning_progress funciona correctamente';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Función get_user_learning_progress tiene problemas: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE '⚠️ No hay usuarios para probar las funciones';
    END IF;
  END IF;
END $$;

-- ========================================
-- INFORMACIÓN DEL SISTEMA
-- ========================================

-- Mostrar información del sistema
SELECT 
  'Sistema de IA de JSensei' as sistema,
  version() as postgresql_version,
  current_database() as database_name,
  current_user as current_user,
  NOW() as verification_time;
