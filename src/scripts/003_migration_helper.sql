-- ========================================
-- JSENSEI - MIGRATION HELPER
-- ========================================
-- Script para migrar datos de la estructura antigua a la nueva
-- IMPORTANTE: Ejecutar solo si ya tienes datos en la estructura antigua

-- ========================================
-- 1. VERIFICAR ESTRUCTURA ANTIGUA
-- ========================================

DO $$
DECLARE
  old_tables TEXT[] := ARRAY[
    'placement_questions', 'placement_responses', 'lessons', 
    'placement_analysis', 'generated_content', 'generated_exercises',
    'exercise_evaluations', 'user_responses', 'adaptive_progress',
    'ai_user_settings', 'ai_usage_logs'
  ];
  table_name TEXT;
  existing_tables TEXT[] := '{}';
BEGIN
  RAISE NOTICE '🔍 Verificando estructura antigua...';
  
  FOREACH table_name IN ARRAY old_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = table_name AND table_schema = 'public'
    ) THEN
      existing_tables := array_append(existing_tables, table_name);
    END IF;
  END LOOP;
  
  IF array_length(existing_tables, 1) > 0 THEN
    RAISE NOTICE '📋 Tablas de estructura antigua encontradas: %', array_to_string(existing_tables, ', ');
    RAISE NOTICE '✅ Puedes proceder con la migración';
  ELSE
    RAISE NOTICE '❌ No se encontraron tablas de la estructura antigua';
    RAISE NOTICE '💡 Puedes usar directamente la nueva estructura';
  END IF;
END $$;

-- ========================================
-- 2. FUNCIÓN DE MIGRACIÓN DE DATOS
-- ========================================

CREATE OR REPLACE FUNCTION public.migrate_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  migrated_users INTEGER := 0;
  migrated_questions INTEGER := 0;
  migrated_content INTEGER := 0;
  migrated_interactions INTEGER := 0;
  migrated_ai_sessions INTEGER := 0;
BEGIN
  RAISE NOTICE '🚀 Iniciando migración de datos...';
  
  -- ========================================
  -- MIGRAR USUARIOS Y PERFILES
  -- ========================================

  -- Los usuarios ya deberían existir en la tabla users
  -- Migrar datos adicionales a users (unificada)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    INSERT INTO public.users (
      id, email, display_name, skill_level, placement_test_completed, placement_test_score,
      total_points, streak_days, last_activity_date
    )
    SELECT
      id,
      email,
      COALESCE(display_name, 'Usuario'),
      COALESCE(skill_level, 'beginner'),
      COALESCE(placement_test_completed, false),
      COALESCE(placement_test_score, 0),
      COALESCE(total_points, 0),
      COALESCE(streak_days, 0),
      COALESCE(last_activity_date, NOW())
    FROM public.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users u2 WHERE u2.id = u.id
    );

    GET DIAGNOSTICS migrated_users = ROW_COUNT;
    RAISE NOTICE '👥 Migrados % usuarios', migrated_users;
  END IF;

  -- Migrar configuraciones de IA si existen
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_user_settings' AND table_schema = 'public') THEN
    UPDATE public.users u
    SET
      ai_model = COALESCE(aus.preferred_model, 'gpt-4o-mini'),
      ai_creativity = COALESCE(aus.creativity_level, 0.7),
      feedback_style = COALESCE(aus.feedback_style, 'encouraging'),
      learning_style = COALESCE(aus.learning_style, 'mixed')
    FROM public.ai_user_settings aus
    WHERE u.id = aus.user_id;

    RAISE NOTICE '⚙️ Migradas configuraciones de IA';
  END IF;
  
  -- ========================================
  -- MIGRAR PREGUNTAS DE NIVELACIÓN
  -- ========================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'placement_questions' AND table_schema = 'public') THEN
    INSERT INTO public.placement_tests (
      question, options, correct_answer, explanation, topic, difficulty_level, points, is_active
    )
    SELECT 
      question,
      options,
      correct_answer,
      COALESCE(explanation, ''),
      COALESCE(topic, 'general'),
      difficulty_level,
      COALESCE(points, 1),
      true
    FROM public.placement_questions
    WHERE NOT EXISTS (
      SELECT 1 FROM public.placement_tests pt 
      WHERE pt.question = public.placement_questions.question
    );
    
    GET DIAGNOSTICS migrated_questions = ROW_COUNT;
    RAISE NOTICE '❓ Migradas % preguntas de nivelación', migrated_questions;
  END IF;
  
  -- ========================================
  -- MIGRAR LEARNING PATHS
  -- ========================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_paths' AND table_schema = 'public') THEN
    -- La tabla learning_paths ya existe en ambas estructuras, pero con campos diferentes
    -- Migrar datos si la estructura antigua tiene campos diferentes
    RAISE NOTICE '📚 Learning paths - verificar manualmente si necesitan migración';
  END IF;
  
  -- ========================================
  -- MIGRAR CONTENIDO GENERADO
  -- ========================================
  
  -- Migrar contenido de generated_content
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_content' AND table_schema = 'public') THEN
    INSERT INTO public.content_items (
      user_id, title, description, topic, content_type, skill_level,
      content, is_generated_by_ai, target_weak_areas, target_strong_areas
    )
    SELECT 
      user_id,
      COALESCE((content->>'title')::TEXT, 'Contenido Generado'),
      COALESCE((content->>'description')::TEXT, ''),
      topic,
      COALESCE(content_type, 'lesson'),
      skill_level,
      content,
      true,
      COALESCE(weak_areas, '{}'),
      COALESCE(strong_areas, '{}')
    FROM public.generated_content
    WHERE NOT EXISTS (
      SELECT 1 FROM public.content_items ci 
      WHERE ci.user_id = public.generated_content.user_id 
      AND ci.topic = public.generated_content.topic
      AND ci.is_generated_by_ai = true
    );
    
    GET DIAGNOSTICS migrated_content = ROW_COUNT;
    RAISE NOTICE '📝 Migrados % elementos de contenido', migrated_content;
  END IF;
  
  -- Migrar ejercicios de generated_exercises
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_exercises' AND table_schema = 'public') THEN
    INSERT INTO public.content_items (
      user_id, title, description, topic, content_type, skill_level,
      content, is_generated_by_ai, target_weak_areas
    )
    SELECT 
      user_id,
      'Ejercicios de ' || topic,
      'Ejercicios generados por IA',
      topic,
      'exercise',
      skill_level,
      exercises,
      true,
      COALESCE(weak_areas, '{}')
    FROM public.generated_exercises
    WHERE NOT EXISTS (
      SELECT 1 FROM public.content_items ci 
      WHERE ci.user_id = public.generated_exercises.user_id 
      AND ci.topic = public.generated_exercises.topic
      AND ci.content_type = 'exercise'
      AND ci.is_generated_by_ai = true
    );
    
    GET DIAGNOSTICS migrated_content = ROW_COUNT;
    RAISE NOTICE '🏋️ Migrados % ejercicios', migrated_content;
  END IF;
  
  -- ========================================
  -- MIGRAR INTERACCIONES DE USUARIOS
  -- ========================================
  
  -- Migrar respuestas de placement test
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'placement_responses' AND table_schema = 'public') THEN
    INSERT INTO public.user_interactions (
      user_id, placement_test_id, interaction_type, user_answer, 
      correct_answer, is_correct, response_time
    )
    SELECT 
      pr.user_id,
      pt.id, -- Mapear question_id a placement_test_id
      'placement_answer',
      pr.selected_answer,
      pt.correct_answer,
      pr.is_correct,
      pr.response_time
    FROM public.placement_responses pr
    JOIN public.placement_tests pt ON pt.question = (
      SELECT question FROM public.placement_questions pq WHERE pq.id = pr.question_id
    )
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_interactions ui 
      WHERE ui.user_id = pr.user_id 
      AND ui.placement_test_id = pt.id
    );
    
    GET DIAGNOSTICS migrated_interactions = ROW_COUNT;
    RAISE NOTICE '📊 Migradas % respuestas de placement test', migrated_interactions;
  END IF;
  
  -- Migrar respuestas de ejercicios
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_responses' AND table_schema = 'public') THEN
    INSERT INTO public.user_interactions (
      user_id, interaction_type, user_answer, is_correct, 
      score, response_time, ai_feedback, ai_suggestions, ai_explanation
    )
    SELECT 
      user_id,
      'exercise_answer',
      user_answer,
      is_correct,
      score,
      response_time,
      feedback,
      suggestions,
      detailed_explanation
    FROM public.user_responses;
    
    GET DIAGNOSTICS migrated_interactions = ROW_COUNT;
    RAISE NOTICE '✏️ Migradas % respuestas de ejercicios', migrated_interactions;
  END IF;
  
  -- ========================================
  -- MIGRAR SESIONES DE IA
  -- ========================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_usage_logs' AND table_schema = 'public') THEN
    INSERT INTO public.ai_sessions (
      user_id, service_type, model_used, tokens_used, cost_estimate,
      processing_time, success, error_message, input_data, created_at
    )
    SELECT 
      user_id,
      service_type,
      model_used,
      COALESCE(tokens_used, 0),
      COALESCE(cost_estimate, 0.0),
      COALESCE(processing_time, 0),
      COALESCE(success, true),
      error_message,
      metadata,
      created_at
    FROM public.ai_usage_logs;
    
    GET DIAGNOSTICS migrated_ai_sessions = ROW_COUNT;
    RAISE NOTICE '🤖 Migradas % sesiones de IA', migrated_ai_sessions;
  END IF;
  
  -- ========================================
  -- ACTUALIZAR ESTADÍSTICAS
  -- ========================================

  -- Actualizar estadísticas de IA en users
  UPDATE public.users u
  SET
    total_ai_tokens_used = COALESCE((
      SELECT SUM(tokens_used)
      FROM public.ai_sessions
      WHERE user_id = u.id
    ), 0),
    ai_usage_count = COALESCE((
      SELECT COUNT(*)
      FROM public.ai_sessions
      WHERE user_id = u.id
    ), 0),
    last_ai_interaction = (
      SELECT MAX(created_at)
      FROM public.ai_sessions
      WHERE user_id = u.id
    );

  RAISE NOTICE '📈 Estadísticas actualizadas';
  
  -- ========================================
  -- RESUMEN DE MIGRACIÓN
  -- ========================================
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '👥 Perfiles de usuario: %', migrated_users;
  RAISE NOTICE '❓ Preguntas de nivelación: %', migrated_questions;
  RAISE NOTICE '📝 Elementos de contenido: %', migrated_content;
  RAISE NOTICE '📊 Interacciones: %', migrated_interactions;
  RAISE NOTICE '🤖 Sesiones de IA: %', migrated_ai_sessions;
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  
END;
$$;

-- ========================================
-- 3. FUNCIÓN PARA RESPALDAR DATOS ANTIGUOS
-- ========================================

CREATE OR REPLACE FUNCTION public.backup_old_structure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  backup_suffix TEXT := '_backup_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
BEGIN
  RAISE NOTICE '💾 Creando respaldo de estructura antigua...';
  
  -- Crear respaldos de las tablas principales
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'placement_questions' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TABLE placement_questions' || backup_suffix || ' AS SELECT * FROM placement_questions';
    RAISE NOTICE '✅ Respaldo creado: placement_questions%', backup_suffix;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'placement_responses' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TABLE placement_responses' || backup_suffix || ' AS SELECT * FROM placement_responses';
    RAISE NOTICE '✅ Respaldo creado: placement_responses%', backup_suffix;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_content' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TABLE generated_content' || backup_suffix || ' AS SELECT * FROM generated_content';
    RAISE NOTICE '✅ Respaldo creado: generated_content%', backup_suffix;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_usage_logs' AND table_schema = 'public') THEN
    EXECUTE 'CREATE TABLE ai_usage_logs' || backup_suffix || ' AS SELECT * FROM ai_usage_logs';
    RAISE NOTICE '✅ Respaldo creado: ai_usage_logs%', backup_suffix;
  END IF;
  
  RAISE NOTICE '💾 Respaldos completados con sufijo: %', backup_suffix;
END;
$$;

-- ========================================
-- 4. FUNCIÓN PARA LIMPIAR ESTRUCTURA ANTIGUA
-- ========================================

CREATE OR REPLACE FUNCTION public.cleanup_old_structure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_tables TEXT[] := ARRAY[
    'placement_questions', 'placement_responses', 'lessons',
    'placement_analysis', 'generated_content', 'generated_exercises',
    'exercise_evaluations', 'user_responses', 'adaptive_progress',
    'ai_user_settings', 'ai_usage_logs'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '🧹 Limpiando estructura antigua...';
  RAISE NOTICE '⚠️  ADVERTENCIA: Esta operación eliminará las tablas antiguas permanentemente';
  
  FOREACH table_name IN ARRAY old_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = table_name AND table_schema = 'public'
    ) THEN
      EXECUTE 'DROP TABLE IF EXISTS ' || table_name || ' CASCADE';
      RAISE NOTICE '🗑️  Eliminada tabla: %', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Limpieza completada';
END;
$$;

-- ========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ========================================

COMMENT ON FUNCTION public.migrate_old_data() IS 'Migra datos de la estructura antigua a la nueva estructura optimizada';
COMMENT ON FUNCTION public.backup_old_structure() IS 'Crea respaldos de las tablas de la estructura antigua antes de la migración';
COMMENT ON FUNCTION public.cleanup_old_structure() IS 'Elimina las tablas de la estructura antigua después de la migración exitosa';

-- ========================================
-- INSTRUCCIONES DE USO
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 INSTRUCCIONES DE MIGRACIÓN';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Crear respaldo: SELECT public.backup_old_structure();';
  RAISE NOTICE '2. Migrar datos: SELECT public.migrate_old_data();';
  RAISE NOTICE '3. Verificar migración con el script de verificación';
  RAISE NOTICE '4. Si todo está bien: SELECT public.cleanup_old_structure();';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Siempre crear respaldos antes de migrar';
  RAISE NOTICE '⚠️  IMPORTANTE: Verificar los datos después de la migración';
  RAISE NOTICE '';
END $$;
