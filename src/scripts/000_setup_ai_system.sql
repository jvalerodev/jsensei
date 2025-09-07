-- Script maestro para configurar el sistema de IA de JSensei
-- Este script ejecuta todos los scripts necesarios en el orden correcto

-- ========================================
-- CONFIGURACIÓN DEL SISTEMA DE IA
-- ========================================
-- Este script configura todas las tablas, funciones y datos necesarios
-- para el sistema de generación de contenido con IA de JSensei

-- Verificar que las tablas base existan
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'La tabla users no existe. Ejecuta primero 001_create_database_schema.sql';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'placement_questions' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'La tabla placement_questions no existe. Ejecuta primero 001_create_database_schema.sql';
  END IF;
END $$;

-- ========================================
-- 1. CREAR TABLAS DEL SISTEMA DE IA
-- ========================================

-- Ejecutar script de creación de tablas de IA
\i 004_create_ai_tables.sql

-- ========================================
-- 2. ACTUALIZAR TABLA DE USUARIOS
-- ========================================

-- Ejecutar script de actualización de usuarios
\i 005_update_users_table.sql

-- ========================================
-- 3. INSERTAR DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Descomenta la siguiente línea si quieres insertar datos de ejemplo
-- \i 006_seed_ai_data.sql

-- ========================================
-- 4. VERIFICAR INSTALACIÓN
-- ========================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
  required_tables TEXT[] := ARRAY[
    'placement_analysis',
    'learning_paths', 
    'generated_content',
    'generated_exercises',
    'exercise_evaluations',
    'adaptive_progress',
    'ai_user_settings',
    'ai_usage_logs'
  ];
  table_name TEXT;
  missing_tables TEXT[] := '{}';
BEGIN
  FOREACH table_name IN ARRAY required_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = table_name AND table_schema = 'public'
    ) THEN
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Faltan las siguientes tablas: %', array_to_string(missing_tables, ', ');
  END IF;
  
  RAISE NOTICE '✅ Todas las tablas del sistema de IA se crearon correctamente';
END $$;

-- Verificar que las funciones se crearon correctamente
DO $$
DECLARE
  required_functions TEXT[] := ARRAY[
    'update_ai_usage_stats',
    'get_user_ai_stats',
    'cleanup_user_ai_data',
    'get_user_learning_progress',
    'create_default_ai_settings'
  ];
  func_name TEXT;
  missing_functions TEXT[] := '{}';
BEGIN
  FOREACH func_name IN ARRAY required_functions LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = func_name AND routine_schema = 'public'
    ) THEN
      missing_functions := array_append(missing_functions, func_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_functions, 1) > 0 THEN
    RAISE EXCEPTION 'Faltan las siguientes funciones: %', array_to_string(missing_functions, ', ');
  END IF;
  
  RAISE NOTICE '✅ Todas las funciones del sistema de IA se crearon correctamente';
END $$;

-- Verificar que los triggers se crearon correctamente
DO $$
DECLARE
  required_triggers TEXT[] := ARRAY[
    'update_ai_usage_stats_trigger',
    'create_default_ai_settings_trigger'
  ];
  trigger_name TEXT;
  missing_triggers TEXT[] := '{}';
BEGIN
  FOREACH trigger_name IN ARRAY required_triggers LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = trigger_name AND event_object_schema = 'public'
    ) THEN
      missing_triggers := array_append(missing_triggers, trigger_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_triggers, 1) > 0 THEN
    RAISE EXCEPTION 'Faltan los siguientes triggers: %', array_to_string(missing_triggers, ', ');
  END IF;
  
  RAISE NOTICE '✅ Todos los triggers del sistema de IA se crearon correctamente';
END $$;

-- ========================================
-- 5. MOSTRAR ESTADÍSTICAS DE INSTALACIÓN
-- ========================================

-- Mostrar resumen de la instalación
SELECT 
  'Sistema de IA de JSensei' as sistema,
  'Instalación Completada' as estado,
  NOW() as fecha_instalacion,
  (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%ai%' 
    OR table_name IN ('placement_analysis', 'learning_paths', 'generated_content', 'generated_exercises', 'exercise_evaluations', 'adaptive_progress', 'ai_user_settings', 'ai_usage_logs')
  ) as tablas_creadas,
  (
    SELECT COUNT(*) 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name LIKE '%ai%'
  ) as funciones_creadas,
  (
    SELECT COUNT(*) 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'public' 
    AND trigger_name LIKE '%ai%'
  ) as triggers_creados;

-- ========================================
-- 6. INSTRUCCIONES POST-INSTALACIÓN
-- ========================================

-- Mostrar instrucciones para el desarrollador
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡Sistema de IA de JSensei instalado correctamente!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASOS:';
  RAISE NOTICE '1. Configura la variable de entorno OPENAI_API_KEY en tu archivo .env.local';
  RAISE NOTICE '2. Reinicia tu servidor de desarrollo';
  RAISE NOTICE '3. Prueba los endpoints de IA en /api/ai/';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 ENDPOINTS DISPONIBLES:';
  RAISE NOTICE '• POST /api/ai/generate-content - Generar contenido educativo';
  RAISE NOTICE '• POST /api/ai/generate-personalized-content - Contenido personalizado';
  RAISE NOTICE '• POST /api/ai/generate-exercises - Generar ejercicios';
  RAISE NOTICE '• POST /api/ai/evaluate-exercise - Evaluar respuestas';
  RAISE NOTICE '';
  RAISE NOTICE '📊 FUNCIONES ÚTILES:';
  RAISE NOTICE '• get_user_ai_stats(user_id) - Estadísticas de uso de IA';
  RAISE NOTICE '• get_user_learning_progress(user_id) - Progreso de aprendizaje';
  RAISE NOTICE '• cleanup_user_ai_data(user_id) - Limpiar datos de usuario (GDPR)';
  RAISE NOTICE '';
  RAISE NOTICE '📚 DOCUMENTACIÓN:';
  RAISE NOTICE '• Ver src/lib/ai/README.md para ejemplos de uso';
  RAISE NOTICE '• Ver src/lib/ai/example-usage.ts para código de ejemplo';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE '• Asegúrate de configurar OPENAI_API_KEY antes de usar el sistema';
  RAISE NOTICE '• Monitorea el uso de tokens para controlar costos';
  RAISE NOTICE '• Los datos de IA se almacenan en las tablas correspondientes';
  RAISE NOTICE '';
END $$;
