-- ========================================
-- JSENSEI - CORE DATABASE SCHEMA
-- ========================================
-- Sistema de tutoría inteligente personalizado para JavaScript
-- Estructura ultra-optimizada y consolidada (SIN user_profiles)
-- Versión: 2.1

-- ========================================
-- 1. TABLA DE USUARIOS 
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate')) DEFAULT 'beginner',
  placement_test_completed BOOLEAN DEFAULT FALSE,
  placement_test_score INTEGER DEFAULT 0,
  current_lesson_id UUID,
  total_points INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. EXÁMENES DE NIVELACIÓN
-- ========================================
CREATE TABLE IF NOT EXISTS public.placement_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de opciones
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  topic TEXT NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate')) NOT NULL,
  points INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. PLANES DE APRENDIZAJE
-- ========================================
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate')) NOT NULL,
  
  -- Análisis del usuario
  weak_areas TEXT[] DEFAULT '{}',
  strong_areas TEXT[] DEFAULT '{}',
  recommended_topics TEXT[] DEFAULT '{}',
  
  -- Estructura del path
  topics JSONB NOT NULL, -- Array de temas ordenados
  estimated_duration INTEGER DEFAULT 0, -- en horas
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  progress_percentage REAL DEFAULT 0.0 CHECK (progress_percentage >= 0.0 AND progress_percentage <= 100.0),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. CONTENIDO EDUCATIVO (UNIFICADO)
-- ========================================
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL para contenido global
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,

  -- Identificador del topic dentro del learning_path
  topic_id UUID, -- Referencia al topic específico en el learning_path

  -- Metadatos
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('lesson', 'exercise', 'quiz', 'explanation', 'example')) NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate')) NOT NULL,

  -- Contenido
  content JSONB NOT NULL, -- Estructura flexible para cualquier tipo de contenido

  -- Configuración
  difficulty_adjustment REAL DEFAULT 1.0,
  estimated_duration INTEGER DEFAULT 15, -- en minutos
  order_index INTEGER DEFAULT 0,

  -- Estado
  is_generated_by_ai BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Personalización (para contenido generado por IA)
  target_weak_areas TEXT[] DEFAULT '{}',
  target_strong_areas TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. PROGRESO DEL USUARIO
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  topic_id UUID,
  
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')) DEFAULT 'not_started',
  
  -- Métricas
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- en segundos
  
  -- Progreso adaptativo
  current_difficulty REAL DEFAULT 1.0,
  recent_scores INTEGER[] DEFAULT '{}', -- Últimos 5 scores
  struggling_areas TEXT[] DEFAULT '{}',
  mastered_concepts TEXT[] DEFAULT '{}',
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, learning_path_id, topic_id)
);

-- ========================================
-- 7. INTERACCIONES DEL USUARIO (UNIFICADO)
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  placement_test_id UUID REFERENCES public.placement_tests(id) ON DELETE CASCADE,
  
  -- Tipo de interacción
  interaction_type TEXT CHECK (interaction_type IN ('placement_answer', 'exercise_answer', 'lesson_completion', 'quiz_answer')) NOT NULL,
  
  -- Datos de la interacción
  user_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  response_time INTEGER, -- en segundos
  
  -- Feedback de IA (si aplica)
  ai_feedback TEXT,
  ai_suggestions TEXT[] DEFAULT '{}',
  ai_explanation TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: debe tener al menos un content_id o placement_test_id
  CHECK (
    (content_id IS NOT NULL AND placement_test_id IS NULL) OR
    (content_id IS NULL AND placement_test_id IS NOT NULL)
  )
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_skill_level ON public.users(skill_level);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON public.users(last_activity_date);

-- Placement Tests
CREATE INDEX IF NOT EXISTS idx_placement_tests_topic ON public.placement_tests(topic);
CREATE INDEX IF NOT EXISTS idx_placement_tests_difficulty ON public.placement_tests(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_placement_tests_active ON public.placement_tests(is_active);

-- Learning Paths
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_skill_level ON public.learning_paths(skill_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON public.learning_paths(is_active);

-- Content Items
CREATE INDEX IF NOT EXISTS idx_contents_user_id ON public.contents(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_learning_path ON public.contents(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_contents_topic_id ON public.contents(topic_id);
CREATE INDEX IF NOT EXISTS idx_contents_type ON public.contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_skill_level ON public.contents(skill_level);
CREATE INDEX IF NOT EXISTS idx_contents_active ON public.contents(is_active);

-- User Progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_learning_path ON public.user_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_interaction ON public.user_progress(last_interaction);

-- User Interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_content ON public.user_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Placement tests policies (public read)
CREATE POLICY "Anyone can view active placement tests" ON public.placement_tests
  FOR SELECT USING (is_active = true);

-- Learning paths policies
CREATE POLICY "Users can manage their own learning paths" ON public.learning_paths
  FOR ALL USING (auth.uid() = user_id);

-- Content items policies
CREATE POLICY "Users can view relevant content" ON public.contents
  FOR SELECT USING (
    is_active = true AND (
      user_id IS NULL OR -- Global content
      auth.uid() = user_id -- Personal content
    )
  );
CREATE POLICY "Users can manage their own content" ON public.contents
  FOR ALL USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can manage their own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- User interactions policies
CREATE POLICY "Users can manage their own interactions" ON public.user_interactions
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- FUNCIONES AUXILIARES
-- ========================================

-- Función para obtener contents por topic_id
CREATE OR REPLACE FUNCTION public.get_contents_by_topic_id(
  p_topic_id UUID
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  content_type TEXT,
  content JSONB,
  order_index INTEGER,
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.title,
    ci.description,
    ci.content_type,
    ci.content,
    ci.order_index,
    ci.estimated_duration,
    ci.created_at
  FROM public.contents ci
  WHERE ci.topic_id = p_topic_id
    AND ci.is_active = TRUE
  ORDER BY ci.order_index ASC;
END;
$$;

-- Función para obtener todos los topics de un learning_path con su contenido
CREATE OR REPLACE FUNCTION public.get_learning_path_with_content(
  p_learning_path_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  topic_id UUID,
  topic_name TEXT,
  content_items JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  learning_path_record RECORD;
  topic_record JSONB;
BEGIN
  -- Obtener el learning_path con sus topics
  SELECT * INTO learning_path_record
  FROM public.learning_paths
  WHERE id = p_learning_path_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Learning path not found: %', p_learning_path_id;
  END IF;

  -- Para cada topic en el JSONB, obtener su contenido
  FOR topic_record IN SELECT * FROM jsonb_array_elements(learning_path_record.topics)
  LOOP
    RETURN QUERY
    SELECT
      ci.topic_id,
      COALESCE(topic_record->>'name', topic_record->>'title', 'Topic sin nombre')::TEXT as topic_name,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', ci.id,
            'title', ci.title,
            'description', ci.description,
            'content_type', ci.content_type,
            'order_index', ci.order_index,
            'estimated_duration', ci.estimated_duration,
            'created_at', ci.created_at
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'::jsonb
      ) as content_items
    FROM public.contents ci
    WHERE ci.learning_path_id = p_learning_path_id
      AND ci.topic_id = (topic_record->>'id')::UUID
      AND (p_user_id IS NULL OR ci.user_id IS NULL OR ci.user_id = p_user_id)
      AND ci.is_active = TRUE;
  END LOOP;
END;
$$;

-- Función para generar contents a partir de un learning_path
CREATE OR REPLACE FUNCTION public.generate_contents_from_learning_path(
  p_learning_path_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(content_id UUID, topic_id UUID, topic_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  learning_path_record RECORD;
  topic_record JSONB;
  new_topic_id UUID;
  new_content_id UUID;
BEGIN
  -- Obtener el learning_path
  SELECT * INTO learning_path_record
  FROM public.learning_paths
  WHERE id = p_learning_path_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Learning path not found: %', p_learning_path_id;
  END IF;

  -- Iterar sobre cada topic en el JSONB
  FOR topic_record IN SELECT * FROM jsonb_array_elements(learning_path_record.topics)
  LOOP
    -- Generar un ID único para este topic si no tiene uno
    new_topic_id := COALESCE(
      (topic_record->>'id')::UUID,
      gen_random_uuid()
    );

    -- Crear un content para este topic (ejemplo básico)
    INSERT INTO public.contents (
      user_id,
      learning_path_id,
      topic_id,
      title,
      content_type,
      skill_level,
      content,
      order_index
    ) VALUES (
      p_user_id,
      p_learning_path_id,
      new_topic_id,
      COALESCE(topic_record->>'title', topic_record->>'name', 'Contenido del tema'),
      'lesson',
      learning_path_record.skill_level,
      topic_record,
      COALESCE((topic_record->>'order')::INTEGER, 0)
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO new_content_id;

    -- Retornar los IDs generados
    RETURN QUERY SELECT
      COALESCE(new_content_id, gen_random_uuid()),
      new_topic_id,
      COALESCE(topic_record->>'name', topic_record->>'title', 'Tema sin nombre');
  END LOOP;
END;
$$;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON public.contents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear registro en users con valores por defecto
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Usuario')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar estadísticas de IA
-- NOTA: Esta función se desactiva temporalmente hasta implementar una nueva estructura
CREATE OR REPLACE FUNCTION public.update_ai_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- TODO: Implementar nueva lógica para estadísticas de IA
  -- Las columnas de estadísticas IA fueron eliminadas de la tabla users
  -- Se necesitará una nueva tabla o mecanismo para almacenar estas estadísticas

  RETURN NEW;
END;
$$;

-- ========================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ========================================

COMMENT ON TABLE public.users IS 'Información básica de usuarios del sistema';
COMMENT ON TABLE public.placement_tests IS 'Preguntas para exámenes de nivelación';
COMMENT ON TABLE public.learning_paths IS 'Planes de aprendizaje personalizados generados por IA';
COMMENT ON TABLE public.contents IS 'Todo tipo de contenido educativo (lecciones, ejercicios, etc.). El campo topic_id referencia el topic específico dentro del learning_path';
COMMENT ON TABLE public.user_progress IS 'Progreso del usuario en su learning path';
COMMENT ON TABLE public.user_interactions IS 'Todas las interacciones del usuario con el contenido';
