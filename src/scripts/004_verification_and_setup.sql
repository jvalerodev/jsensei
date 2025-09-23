-- ========================================
-- JSENSEI - VERIFICATION AND SETUP
-- ========================================
-- Script para verificar la instalación y configurar el sistema

-- ========================================
-- 1. VERIFICACIÓN DE ESTRUCTURA
-- ========================================

DO $$
DECLARE
  required_tables TEXT[] := ARRAY[
    'users', 'placement_tests', 'learning_paths',
    'content_items', 'user_progress', 'user_interactions', 'ai_sessions'
  ];
  required_functions TEXT[] := ARRAY[
    'update_updated_at_column', 'handle_new_user', 'update_ai_stats',
    'get_user_stats', 'get_learning_path_progress', 'cleanup_user_data'
  ];
  required_views TEXT[] := ARRAY['system_stats', 'recent_activity'];
  
  table_name TEXT;
  func_name TEXT;
  view_name TEXT;
  missing_items TEXT[] := '{}';
  all_good BOOLEAN := true;
BEGIN
  RAISE NOTICE '🔍 VERIFICANDO INSTALACIÓN DE JSENSEI';
  RAISE NOTICE '========================================';
  
  -- Verificar tablas
  RAISE NOTICE '📋 Verificando tablas...';
  FOREACH table_name IN ARRAY required_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = table_name AND table_schema = 'public'
    ) THEN
      missing_items := array_append(missing_items, 'tabla: ' || table_name);
      all_good := false;
    ELSE
      RAISE NOTICE '  ✅ %', table_name;
    END IF;
  END LOOP;
  
  -- Verificar funciones
  RAISE NOTICE '⚙️ Verificando funciones...';
  FOREACH func_name IN ARRAY required_functions LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = func_name AND routine_schema = 'public'
    ) THEN
      missing_items := array_append(missing_items, 'función: ' || func_name);
      all_good := false;
    ELSE
      RAISE NOTICE '  ✅ %', func_name;
    END IF;
  END LOOP;
  
  -- Verificar vistas
  RAISE NOTICE '👁️ Verificando vistas...';
  FOREACH view_name IN ARRAY required_views LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_name = view_name AND table_schema = 'public'
    ) THEN
      missing_items := array_append(missing_items, 'vista: ' || view_name);
      all_good := false;
    ELSE
      RAISE NOTICE '  ✅ %', view_name;
    END IF;
  END LOOP;
  
  -- Resultado final
  IF all_good THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ¡INSTALACIÓN VERIFICADA EXITOSAMENTE!';
    RAISE NOTICE '✅ Todas las tablas, funciones y vistas están presentes';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '❌ FALTAN ELEMENTOS:';
    FOR i IN 1..array_length(missing_items, 1) LOOP
      RAISE NOTICE '  - %', missing_items[i];
    END LOOP;
    RAISE EXCEPTION 'Instalación incompleta. Revisa los scripts anteriores.';
  END IF;
END $$;

-- ========================================
-- 2. VERIFICACIÓN DE DATOS
-- ========================================

DO $$
DECLARE
  placement_count INTEGER;
  content_count INTEGER;
  user_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICANDO DATOS INICIALES';
  RAISE NOTICE '========================================';
  
  -- Contar preguntas de placement test
  SELECT COUNT(*) INTO placement_count FROM public.placement_tests WHERE is_active = true;
  RAISE NOTICE '❓ Preguntas de nivelación activas: %', placement_count;
  
  IF placement_count = 0 THEN
    RAISE NOTICE '⚠️  No hay preguntas de nivelación. Ejecuta 002_seed_initial_data.sql';
  END IF;
  
  -- Contar contenido base
  SELECT COUNT(*) INTO content_count FROM public.content_items WHERE user_id IS NULL AND is_active = true;
  RAISE NOTICE '📚 Contenido base disponible: %', content_count;
  
  IF content_count = 0 THEN
    RAISE NOTICE '⚠️  No hay contenido base. Ejecuta 002_seed_initial_data.sql';
  END IF;
  
  -- Contar usuarios
  SELECT COUNT(*) INTO user_count FROM public.users;
  RAISE NOTICE '👥 Usuarios registrados: %', user_count;
  
  RAISE NOTICE '';
  IF placement_count > 0 AND content_count > 0 THEN
    RAISE NOTICE '✅ Sistema listo para usar';
  ELSE
    RAISE NOTICE '⚠️  Sistema necesita datos iniciales';
  END IF;
END $$;

-- ========================================
-- 3. VERIFICACIÓN DE RENDIMIENTO
-- ========================================

DO $$
DECLARE
  index_count INTEGER;
  missing_indexes TEXT[] := '{}';
  expected_indexes TEXT[] := ARRAY[
    'idx_users_email', 'idx_users_skill_level', 'idx_users_last_activity',
    'idx_placement_tests_topic', 'idx_learning_paths_user_id', 'idx_content_items_topic',
    'idx_user_progress_user_id', 'idx_user_interactions_user_id', 'idx_ai_sessions_user_id'
  ];
  index_name TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚀 VERIFICANDO ÍNDICES DE RENDIMIENTO';
  RAISE NOTICE '========================================';
  
  FOREACH index_name IN ARRAY expected_indexes LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = index_name AND schemaname = 'public'
    ) THEN
      missing_indexes := array_append(missing_indexes, index_name);
    END IF;
  END LOOP;
  
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%';
  
  RAISE NOTICE '📈 Índices creados: %', index_count;
  
  IF array_length(missing_indexes, 1) > 0 THEN
    RAISE NOTICE '⚠️  Índices faltantes: %', array_to_string(missing_indexes, ', ');
  ELSE
    RAISE NOTICE '✅ Todos los índices están presentes';
  END IF;
END $$;

-- ========================================
-- 4. VERIFICACIÓN DE SEGURIDAD (RLS)
-- ========================================

DO $$
DECLARE
  rls_tables TEXT[] := ARRAY[
    'users', 'placement_tests', 'learning_paths',
    'content_items', 'user_progress', 'user_interactions', 'ai_sessions'
  ];
  table_name TEXT;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
  tables_without_rls TEXT[] := '{}';
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔒 VERIFICANDO SEGURIDAD (RLS)';
  RAISE NOTICE '========================================';
  
  FOREACH table_name IN ARRAY rls_tables LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relname = table_name AND n.nspname = 'public';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = table_name AND schemaname = 'public';
    
    IF rls_enabled AND policy_count > 0 THEN
      RAISE NOTICE '  ✅ % (% políticas)', table_name, policy_count;
    ELSE
      tables_without_rls := array_append(tables_without_rls, table_name);
      RAISE NOTICE '  ❌ % (RLS: %, Políticas: %)', table_name, rls_enabled, policy_count;
    END IF;
  END LOOP;
  
  IF array_length(tables_without_rls, 1) = 0 THEN
    RAISE NOTICE '✅ RLS configurado correctamente en todas las tablas';
  ELSE
    RAISE NOTICE '⚠️  Tablas sin RLS adecuado: %', array_to_string(tables_without_rls, ', ');
  END IF;
END $$;

-- ========================================
-- 5. PRUEBAS FUNCIONALES
-- ========================================

-- Función para ejecutar pruebas básicas
CREATE OR REPLACE FUNCTION public.run_system_tests()
RETURNS TABLE (
  test_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Test 1: Crear usuario de prueba
  BEGIN
    INSERT INTO public.users (id, email, display_name) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'test@jsensei.com', 'Usuario Test')
    ON CONFLICT (id) DO NOTHING;
    
    RETURN QUERY SELECT 'Crear usuario'::TEXT, 'PASS'::TEXT, 'Usuario de prueba creado'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Crear usuario'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 2: Verificar que el usuario se creó correctamente
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.users
      WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN
      RETURN QUERY SELECT 'Crear usuario'::TEXT, 'PASS'::TEXT, 'Usuario creado correctamente'::TEXT;
    ELSE
      RETURN QUERY SELECT 'Crear usuario'::TEXT, 'FAIL'::TEXT, 'Usuario no se creó'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Crear usuario'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 3: Función get_user_stats
  BEGIN
    PERFORM public.get_user_stats('00000000-0000-0000-0000-000000000001');
    RETURN QUERY SELECT 'Función get_user_stats'::TEXT, 'PASS'::TEXT, 'Función ejecutada correctamente'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Función get_user_stats'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 4: Vista system_stats
  BEGIN
    PERFORM * FROM public.system_stats LIMIT 1;
    RETURN QUERY SELECT 'Vista system_stats'::TEXT, 'PASS'::TEXT, 'Vista accesible'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Vista system_stats'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 5: Insertar sesión de IA
  BEGIN
    INSERT INTO public.ai_sessions (
      user_id, service_type, model_used, tokens_used, success
    ) VALUES (
      '00000000-0000-0000-0000-000000000001', 
      'test', 'gpt-4o-mini', 100, true
    );
    
    RETURN QUERY SELECT 'Insertar sesión IA'::TEXT, 'PASS'::TEXT, 'Sesión de IA registrada'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Insertar sesión IA'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 6: Verificar trigger de estadísticas IA
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.users
      WHERE id = '00000000-0000-0000-0000-000000000001'
      AND total_ai_tokens_used > 0
    ) THEN
      RETURN QUERY SELECT 'Trigger estadísticas IA'::TEXT, 'PASS'::TEXT, 'Estadísticas actualizadas automáticamente'::TEXT;
    ELSE
      RETURN QUERY SELECT 'Trigger estadísticas IA'::TEXT, 'FAIL'::TEXT, 'Estadísticas no se actualizaron'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Trigger estadísticas IA'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;

  -- Limpiar datos de prueba
  DELETE FROM public.ai_sessions WHERE user_id = '00000000-0000-0000-0000-000000000001';
  DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001';
END;
$$;

-- Ejecutar pruebas
DO $$
DECLARE
  test_result RECORD;
  passed_tests INTEGER := 0;
  total_tests INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧪 EJECUTANDO PRUEBAS FUNCIONALES';
  RAISE NOTICE '========================================';
  
  FOR test_result IN SELECT * FROM public.run_system_tests() LOOP
    total_tests := total_tests + 1;
    
    IF test_result.status = 'PASS' THEN
      passed_tests := passed_tests + 1;
      RAISE NOTICE '  ✅ %: %', test_result.test_name, test_result.details;
    ELSE
      RAISE NOTICE '  ❌ %: %', test_result.test_name, test_result.details;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESULTADOS: % de % pruebas pasaron', passed_tests, total_tests;
  
  IF passed_tests = total_tests THEN
    RAISE NOTICE '🎉 ¡TODAS LAS PRUEBAS PASARON!';
  ELSE
    RAISE NOTICE '⚠️  Algunas pruebas fallaron. Revisa la configuración.';
  END IF;
END $$;

-- ========================================
-- 6. CONFIGURACIÓN INICIAL DEL SISTEMA
-- ========================================

-- Crear configuración global del sistema
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO public.system_config (key, value, description) VALUES
('ai_models', '["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]', 'Modelos de IA disponibles'),
('skill_levels', '["beginner", "intermediate", "advanced"]', 'Niveles de habilidad soportados'),
('content_types', '["lesson", "exercise", "quiz", "explanation", "example"]', 'Tipos de contenido disponibles'),
('difficulty_preferences', '["easy", "balanced", "challenging"]', 'Preferencias de dificultad'),
('learning_styles', '["visual", "practical", "theoretical", "mixed"]', 'Estilos de aprendizaje'),
('feedback_styles', '["encouraging", "direct", "detailed", "brief"]', 'Estilos de feedback'),
('placement_test_config', '{
  "questions_per_level": {"beginner": 10, "intermediate": 8, "advanced": 5},
  "passing_scores": {"beginner": 60, "intermediate": 70, "advanced": 80},
  "time_limit_minutes": 30
}', 'Configuración del examen de nivelación'),
('ai_generation_config', '{
  "max_tokens": 2000,
  "temperature": 0.7,
  "content_generation_prompt": "Genera contenido educativo para JavaScript...",
  "exercise_generation_prompt": "Crea ejercicios prácticos para..."
}', 'Configuración para generación de contenido con IA')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS para system_config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política para system_config (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can read system config" ON public.system_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- 7. ESTADÍSTICAS FINALES
-- ========================================

DO $$
DECLARE
  stats RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📈 ESTADÍSTICAS DEL SISTEMA';
  RAISE NOTICE '========================================';
  
  SELECT * INTO stats FROM public.system_stats;
  
  RAISE NOTICE '👥 Usuarios totales: %', COALESCE(stats.total_users, 0);
  RAISE NOTICE '👥 Usuarios con placement test: %', COALESCE(stats.users_with_placement, 0);
  RAISE NOTICE '📚 Learning paths activos: %', COALESCE(stats.active_learning_paths, 0);
  RAISE NOTICE '📝 Elementos de contenido: %', COALESCE(stats.total_content_items, 0);
  RAISE NOTICE '🤖 Contenido generado por IA: %', COALESCE(stats.ai_generated_content, 0);
  RAISE NOTICE '🏆 Puntos promedio por usuario: %', ROUND(COALESCE(stats.avg_user_points, 0), 2);
  RAISE NOTICE '🔢 Tokens de IA utilizados: %', COALESCE(stats.total_ai_tokens_used, 0);
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 SISTEMA JSENSEI LISTO PARA USAR';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 Próximos pasos:';
  RAISE NOTICE '  1. Configurar variables de entorno (OPENAI_API_KEY)';
  RAISE NOTICE '  2. Reiniciar el servidor de desarrollo';
  RAISE NOTICE '  3. Probar el registro de usuarios';
  RAISE NOTICE '  4. Verificar la generación de contenido con IA';
  RAISE NOTICE '';
END $$;

-- Limpiar función de pruebas
DROP FUNCTION IF EXISTS public.run_system_tests();

-- ========================================
-- COMENTARIOS FINALES
-- ========================================

COMMENT ON TABLE public.system_config IS 'Configuración global del sistema JSensei';

-- Mensaje final
SELECT 
  '🎉 JSensei Database Setup Complete! 🎉' as message,
  NOW() as completed_at,
  'Ready for JavaScript tutoring with AI!' as status;
