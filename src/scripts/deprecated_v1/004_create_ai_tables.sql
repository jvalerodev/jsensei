-- Script para crear las tablas necesarias para el sistema de IA de JSensei
-- Este script debe ejecutarse después de 001_create_database_schema.sql

-- Tabla para almacenar análisis de pruebas de nivelación
CREATE TABLE IF NOT EXISTS public.placement_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate')) NOT NULL,
  weak_areas TEXT[] DEFAULT '{}',
  strong_areas TEXT[] DEFAULT '{}',
  recommended_topics TEXT[] DEFAULT '{}',
  personalized_advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar planes de aprendizaje generados por IA
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL, -- ID único del plan generado por IA
  title TEXT NOT NULL,
  description TEXT,
  topics JSONB NOT NULL, -- Array de temas del plan de aprendizaje
  estimated_duration INTEGER DEFAULT 0, -- en horas
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

-- Tabla para almacenar contenido generado por IA
CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate')) NOT NULL,
  content JSONB NOT NULL, -- Contenido generado (título, explicación, ejemplos, ejercicios)
  weak_areas TEXT[] DEFAULT '{}',
  strong_areas TEXT[] DEFAULT '{}',
  content_type TEXT CHECK (content_type IN ('lesson', 'exercise', 'explanation', 'adaptive')) DEFAULT 'lesson',
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar ejercicios generados por IA
CREATE TABLE IF NOT EXISTS public.generated_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate')) NOT NULL,
  weak_areas TEXT[] DEFAULT '{}',
  exercises JSONB NOT NULL, -- Array de ejercicios generados
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar evaluaciones de ejercicios con IA
CREATE TABLE IF NOT EXISTS public.exercise_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  suggestions TEXT[] DEFAULT '{}',
  detailed_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar respuestas de usuarios a ejercicios (actualizada)
CREATE TABLE IF NOT EXISTS public.user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  suggestions TEXT[] DEFAULT '{}',
  detailed_explanation TEXT,
  response_time INTEGER, -- en segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar progreso de aprendizaje adaptativo
CREATE TABLE IF NOT EXISTS public.adaptive_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  recent_scores INTEGER[] DEFAULT '{}',
  time_spent INTEGER DEFAULT 0, -- en segundos
  struggling_areas TEXT[] DEFAULT '{}',
  mastered_areas TEXT[] DEFAULT '{}',
  difficulty_adjustment REAL DEFAULT 1.0, -- Factor de ajuste de dificultad
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Tabla para almacenar configuraciones de IA por usuario
CREATE TABLE IF NOT EXISTS public.ai_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preferred_model TEXT CHECK (preferred_model IN ('gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo')) DEFAULT 'gpt-4o-mini',
  creativity_level REAL CHECK (creativity_level >= 0.0 AND creativity_level <= 1.0) DEFAULT 0.7,
  difficulty_preference TEXT CHECK (difficulty_preference IN ('conservative', 'balanced', 'challenging')) DEFAULT 'balanced',
  learning_style TEXT CHECK (learning_style IN ('visual', 'practical', 'theoretical', 'mixed')) DEFAULT 'mixed',
  feedback_style TEXT CHECK (feedback_style IN ('encouraging', 'direct', 'detailed', 'brief')) DEFAULT 'encouraging',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla para logs de uso de IA
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'content_generation', 'exercise_evaluation', 'analysis', etc.
  model_used TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 6) DEFAULT 0.0,
  processing_time INTEGER DEFAULT 0, -- en milisegundos
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security para las nuevas tablas
ALTER TABLE public.placement_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para placement_analysis
CREATE POLICY "Users can view their own placement analysis" ON public.placement_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own placement analysis" ON public.placement_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own placement analysis" ON public.placement_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para learning_paths
CREATE POLICY "Users can view their own learning paths" ON public.learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning paths" ON public.learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths" ON public.learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para generated_content
CREATE POLICY "Users can view their own generated content" ON public.generated_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated content" ON public.generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated content" ON public.generated_content
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para generated_exercises
CREATE POLICY "Users can view their own generated exercises" ON public.generated_exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated exercises" ON public.generated_exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated exercises" ON public.generated_exercises
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para exercise_evaluations
CREATE POLICY "Users can view their own exercise evaluations" ON public.exercise_evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise evaluations" ON public.exercise_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para user_responses (actualizadas)
CREATE POLICY "Users can view their own responses" ON public.user_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON public.user_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" ON public.user_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para adaptive_progress
CREATE POLICY "Users can view their own adaptive progress" ON public.adaptive_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adaptive progress" ON public.adaptive_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adaptive progress" ON public.adaptive_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para ai_user_settings
CREATE POLICY "Users can view their own AI settings" ON public.ai_user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings" ON public.ai_user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings" ON public.ai_user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para ai_usage_logs
CREATE POLICY "Users can view their own AI usage logs" ON public.ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage logs" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_placement_analysis_user_id ON public.placement_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_placement_analysis_created_at ON public.placement_analysis(created_at);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_path_id ON public.learning_paths(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_is_active ON public.learning_paths(is_active);

CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_topic ON public.generated_content(topic);
CREATE INDEX IF NOT EXISTS idx_generated_content_skill_level ON public.generated_content(skill_level);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON public.generated_content(created_at);

CREATE INDEX IF NOT EXISTS idx_generated_exercises_user_id ON public.generated_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_exercises_topic ON public.generated_exercises(topic);
CREATE INDEX IF NOT EXISTS idx_generated_exercises_is_completed ON public.generated_exercises(is_completed);

CREATE INDEX IF NOT EXISTS idx_exercise_evaluations_user_id ON public.exercise_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_evaluations_exercise_id ON public.exercise_evaluations(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_evaluations_created_at ON public.exercise_evaluations(created_at);

CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON public.user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_exercise_id ON public.user_responses(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_created_at ON public.user_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_adaptive_progress_user_id ON public.adaptive_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_progress_topic ON public.adaptive_progress(topic);
CREATE INDEX IF NOT EXISTS idx_adaptive_progress_last_updated ON public.adaptive_progress(last_updated);

CREATE INDEX IF NOT EXISTS idx_ai_user_settings_user_id ON public.ai_user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_service_type ON public.ai_usage_logs(service_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Crear triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_placement_analysis_updated_at
  BEFORE UPDATE ON public.placement_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_exercises_updated_at
  BEFORE UPDATE ON public.generated_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_progress_updated_at
  BEFORE UPDATE ON public.adaptive_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_user_settings_updated_at
  BEFORE UPDATE ON public.ai_user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear configuraciones de IA por defecto para nuevos usuarios
CREATE OR REPLACE FUNCTION public.create_default_ai_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para configuraciones de IA por defecto
CREATE TRIGGER create_default_ai_settings_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_ai_settings();

-- Función para limpiar logs antiguos de IA (mantener solo los últimos 30 días)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_usage_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Comentarios para documentar las tablas
COMMENT ON TABLE public.placement_analysis IS 'Almacena análisis de pruebas de nivelación generados por IA';
COMMENT ON TABLE public.learning_paths IS 'Almacena planes de aprendizaje personalizados generados por IA';
COMMENT ON TABLE public.generated_content IS 'Almacena contenido educativo generado por IA';
COMMENT ON TABLE public.generated_exercises IS 'Almacena ejercicios generados por IA para refuerzo';
COMMENT ON TABLE public.exercise_evaluations IS 'Almacena evaluaciones de ejercicios realizadas por IA';
COMMENT ON TABLE public.adaptive_progress IS 'Almacena progreso adaptativo del usuario para personalización';
COMMENT ON TABLE public.ai_user_settings IS 'Almacena configuraciones personalizadas de IA por usuario';
COMMENT ON TABLE public.ai_usage_logs IS 'Almacena logs de uso de servicios de IA para monitoreo y facturación';
