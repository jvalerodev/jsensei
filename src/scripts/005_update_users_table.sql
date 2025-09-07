-- Script para actualizar la tabla de usuarios con campos necesarios para el sistema de IA
-- Este script debe ejecutarse después de 004_create_ai_tables.sql

-- Agregar campos necesarios para el sistema de IA a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS preferred_learning_style TEXT CHECK (preferred_learning_style IN ('visual', 'practical', 'theoretical', 'mixed')) DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS ai_feedback_level TEXT CHECK (ai_feedback_level IN ('minimal', 'standard', 'detailed')) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS last_ai_interaction TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_ai_tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_usage_count INTEGER DEFAULT 0;

-- Actualizar la columna skill_level para solo incluir 'beginner' e 'intermediate'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_skill_level_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_skill_level_check 
CHECK (skill_level IN ('beginner', 'intermediate'));

-- Crear función para actualizar estadísticas de uso de IA
CREATE OR REPLACE FUNCTION public.update_ai_usage_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Actualizar estadísticas cuando se inserta un log de uso de IA
  UPDATE public.users 
  SET 
    total_ai_tokens_used = total_ai_tokens_used + COALESCE(NEW.tokens_used, 0),
    ai_usage_count = ai_usage_count + 1,
    last_ai_interaction = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para actualizar estadísticas de IA automáticamente
CREATE TRIGGER update_ai_usage_stats_trigger
  AFTER INSERT ON public.ai_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_usage_stats();

-- Función para obtener estadísticas de uso de IA de un usuario
CREATE OR REPLACE FUNCTION public.get_user_ai_stats(user_uuid UUID)
RETURNS TABLE (
  total_tokens_used INTEGER,
  total_requests INTEGER,
  last_interaction TIMESTAMP WITH TIME ZONE,
  most_used_service TEXT,
  average_processing_time INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.total_ai_tokens_used,
    u.ai_usage_count,
    u.last_ai_interaction,
    (
      SELECT service_type 
      FROM public.ai_usage_logs 
      WHERE user_id = user_uuid 
      GROUP BY service_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as most_used_service,
    (
      SELECT AVG(processing_time)::INTEGER 
      FROM public.ai_usage_logs 
      WHERE user_id = user_uuid AND processing_time > 0
    ) as average_processing_time
  FROM public.users u
  WHERE u.id = user_uuid;
END;
$$;

-- Función para limpiar datos de IA de un usuario (GDPR compliance)
CREATE OR REPLACE FUNCTION public.cleanup_user_ai_data(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eliminar todos los datos de IA del usuario
  DELETE FROM public.ai_usage_logs WHERE user_id = user_uuid;
  DELETE FROM public.adaptive_progress WHERE user_id = user_uuid;
  DELETE FROM public.exercise_evaluations WHERE user_id = user_uuid;
  DELETE FROM public.generated_exercises WHERE user_id = user_uuid;
  DELETE FROM public.generated_content WHERE user_id = user_uuid;
  DELETE FROM public.learning_paths WHERE user_id = user_uuid;
  DELETE FROM public.placement_analysis WHERE user_id = user_uuid;
  DELETE FROM public.ai_user_settings WHERE user_id = user_uuid;
  
  -- Resetear estadísticas de IA en la tabla users
  UPDATE public.users 
  SET 
    total_ai_tokens_used = 0,
    ai_usage_count = 0,
    last_ai_interaction = NULL
  WHERE id = user_uuid;
END;
$$;

-- Función para obtener el progreso de aprendizaje de un usuario
CREATE OR REPLACE FUNCTION public.get_user_learning_progress(user_uuid UUID)
RETURNS TABLE (
  total_lessons_completed INTEGER,
  total_exercises_completed INTEGER,
  average_score DECIMAL(5,2),
  current_skill_level TEXT,
  weak_areas TEXT[],
  strong_areas TEXT[],
  recommended_next_topics TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      SELECT COUNT(*)::INTEGER 
      FROM public.user_progress 
      WHERE user_id = user_uuid AND status = 'completed'
    ) as total_lessons_completed,
    (
      SELECT COUNT(*)::INTEGER 
      FROM public.user_responses 
      WHERE user_id = user_uuid
    ) as total_exercises_completed,
    (
      SELECT AVG(score)::DECIMAL(5,2) 
      FROM public.user_responses 
      WHERE user_id = user_uuid AND score IS NOT NULL
    ) as average_score,
    u.skill_level,
    COALESCE(pa.weak_areas, '{}') as weak_areas,
    COALESCE(pa.strong_areas, '{}') as strong_areas,
    COALESCE(pa.recommended_topics, '{}') as recommended_next_topics
  FROM public.users u
  LEFT JOIN public.placement_analysis pa ON u.id = pa.user_id
  WHERE u.id = user_uuid;
END;
$$;

-- Crear vista para estadísticas de uso de IA
CREATE OR REPLACE VIEW public.ai_usage_stats AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.email,
  u.skill_level,
  u.total_ai_tokens_used,
  u.ai_usage_count,
  u.last_ai_interaction,
  u.ai_enabled,
  u.preferred_learning_style,
  u.ai_feedback_level,
  (
    SELECT COUNT(*) 
    FROM public.generated_content 
    WHERE user_id = u.id
  ) as content_generated_count,
  (
    SELECT COUNT(*) 
    FROM public.generated_exercises 
    WHERE user_id = u.id
  ) as exercises_generated_count,
  (
    SELECT COUNT(*) 
    FROM public.learning_paths 
    WHERE user_id = u.id
  ) as learning_paths_created_count
FROM public.users u
WHERE u.ai_enabled = TRUE;

-- Comentarios para los nuevos campos
COMMENT ON COLUMN public.users.ai_enabled IS 'Indica si el usuario tiene habilitado el sistema de IA';
COMMENT ON COLUMN public.users.preferred_learning_style IS 'Estilo de aprendizaje preferido del usuario';
COMMENT ON COLUMN public.users.ai_feedback_level IS 'Nivel de detalle del feedback de IA preferido';
COMMENT ON COLUMN public.users.last_ai_interaction IS 'Última vez que el usuario interactuó con el sistema de IA';
COMMENT ON COLUMN public.users.total_ai_tokens_used IS 'Total de tokens de IA utilizados por el usuario';
COMMENT ON COLUMN public.users.ai_usage_count IS 'Número total de solicitudes de IA realizadas por el usuario';

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_users_ai_enabled ON public.users(ai_enabled);
CREATE INDEX IF NOT EXISTS idx_users_last_ai_interaction ON public.users(last_ai_interaction);
CREATE INDEX IF NOT EXISTS idx_users_skill_level ON public.users(skill_level);
