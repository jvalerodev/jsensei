-- Script para insertar datos de ejemplo para el sistema de IA
-- Este script debe ejecutarse después de 005_update_users_table.sql

-- Insertar configuraciones de IA de ejemplo para usuarios existentes
INSERT INTO public.ai_user_settings (user_id, preferred_model, creativity_level, difficulty_preference, learning_style, feedback_style)
SELECT 
  id,
  'gpt-4o-mini',
  0.7,
  'balanced',
  'mixed',
  'encouraging'
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.ai_user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Insertar algunos logs de uso de IA de ejemplo (últimos 7 días)
INSERT INTO public.ai_usage_logs (user_id, service_type, model_used, tokens_used, cost_estimate, processing_time, success, metadata)
SELECT 
  u.id,
  'content_generation',
  'gpt-4o-mini',
  floor(random() * 500 + 100)::INTEGER,
  (floor(random() * 500 + 100) * 0.00003)::DECIMAL(10, 6),
  floor(random() * 2000 + 500)::INTEGER,
  true,
  '{"topic": "variables", "skill_level": "beginner"}'::jsonb
FROM public.users u
CROSS JOIN generate_series(1, 3) as s
WHERE random() < 0.3; -- Solo para algunos usuarios

-- Insertar progreso adaptativo de ejemplo
INSERT INTO public.adaptive_progress (user_id, topic, current_level, recent_scores, time_spent, struggling_areas, mastered_areas, difficulty_adjustment)
SELECT 
  u.id,
  'variables',
  'beginner',
  ARRAY[70, 75, 80, 85],
  floor(random() * 1800 + 600)::INTEGER, -- 10-40 minutos
  ARRAY['scope', 'hoisting'],
  ARRAY['declaration', 'assignment'],
  1.0
FROM public.users u
WHERE random() < 0.5;

INSERT INTO public.adaptive_progress (user_id, topic, current_level, recent_scores, time_spent, struggling_areas, mastered_areas, difficulty_adjustment)
SELECT 
  u.id,
  'functions',
  'intermediate',
  ARRAY[80, 85, 90, 88],
  floor(random() * 2400 + 1200)::INTEGER, -- 20-60 minutos
  ARRAY['closures', 'this-context'],
  ARRAY['arrow-functions', 'parameters'],
  1.2
FROM public.users u
WHERE random() < 0.3;

-- Insertar algunos análisis de prueba de nivelación de ejemplo
INSERT INTO public.placement_analysis (user_id, skill_level, weak_areas, strong_areas, recommended_topics, personalized_advice)
SELECT 
  u.id,
  CASE 
    WHEN random() < 0.6 THEN 'beginner'
    ELSE 'intermediate'
  END,
  ARRAY['closures', 'async-programming', 'error-handling'],
  ARRAY['variables', 'functions', 'arrays'],
  ARRAY['async-await', 'promises', 'closures', 'error-handling'],
  'Basado en tu prueba de nivelación, te recomendamos enfocarte en conceptos de programación asíncrona. Tienes una buena base en JavaScript básico, así que puedes avanzar a temas más avanzados.'
FROM public.users u
WHERE random() < 0.4;

-- Insertar planes de aprendizaje de ejemplo
INSERT INTO public.learning_paths (user_id, path_id, title, description, topics, estimated_duration, is_active)
SELECT 
  u.id,
  'path-' || u.id || '-' || extract(epoch from now())::text,
  'Plan de Aprendizaje Personalizado - JavaScript',
  'Plan de aprendizaje generado por IA basado en tu prueba de nivelación',
  '[
    {
      "id": "topic-1",
      "title": "Variables y Scope",
      "description": "Aprende sobre declaración de variables y scope en JavaScript",
      "difficulty": "beginner",
      "estimatedTime": 30,
      "content": {
        "title": "Variables y Scope en JavaScript",
        "content": "Las variables son fundamentales en JavaScript...",
        "examples": [],
        "exercises": []
      }
    },
    {
      "id": "topic-2", 
      "title": "Funciones Arrow",
      "description": "Domina la sintaxis moderna de funciones",
      "difficulty": "beginner",
      "estimatedTime": 25,
      "content": {
        "title": "Funciones Arrow en JavaScript",
        "content": "Las funciones arrow son una característica moderna...",
        "examples": [],
        "exercises": []
      }
    }
  ]'::jsonb,
  2,
  true
FROM public.users u
WHERE random() < 0.3;

-- Insertar contenido generado de ejemplo
INSERT INTO public.generated_content (user_id, topic, skill_level, content, weak_areas, strong_areas, content_type)
SELECT 
  u.id,
  'variables',
  'beginner',
  '{
    "title": "Variables en JavaScript - Guía Completa",
    "content": "Las variables son contenedores que almacenan datos. En JavaScript moderno, tenemos tres formas de declarar variables: let, const y var...",
    "examples": [
      {
        "title": "Declaración de variables",
        "code": "let nombre = \"Juan\";\nconst edad = 25;\nvar ciudad = \"Madrid\";",
        "explanation": "Aquí vemos los tres tipos de declaración de variables"
      }
    ],
    "exercises": [
      {
        "id": "ex-1",
        "question": "¿Cuál es la diferencia entre let y const?",
        "type": "multiple-choice",
        "options": ["let es mutable, const es inmutable", "No hay diferencia", "const es más rápido"],
        "correctAnswer": "let es mutable, const es inmutable",
        "explanation": "let permite reasignación, const no",
        "difficulty": "beginner"
      }
    ]
  }'::jsonb,
  ARRAY['scope', 'hoisting'],
  ARRAY['declaration', 'assignment'],
  'lesson'
FROM public.users u
WHERE random() < 0.2;

-- Insertar ejercicios generados de ejemplo
INSERT INTO public.generated_exercises (user_id, topic, skill_level, weak_areas, exercises, is_completed)
SELECT 
  u.id,
  'closures',
  'intermediate',
  ARRAY['scope', 'lexical-environment'],
  '{
    "title": "Ejercicios de Refuerzo - Closures",
    "content": "Practica con closures para reforzar tu comprensión",
    "exercises": [
      {
        "id": "closure-ex-1",
        "question": "¿Qué imprime este código?",
        "type": "code-completion",
        "correctAnswer": "10",
        "explanation": "La closure mantiene la referencia a la variable x",
        "difficulty": "intermediate"
      }
    ]
  }'::jsonb,
  false
FROM public.users u
WHERE random() < 0.2;

-- Insertar algunas evaluaciones de ejercicios de ejemplo
INSERT INTO public.exercise_evaluations (user_id, exercise_id, user_answer, is_correct, score, feedback, suggestions, detailed_explanation)
SELECT 
  u.id,
  'ex-1',
  'let es mutable, const es inmutable',
  true,
  95,
  '¡Excelente! Tu respuesta es correcta.',
  ARRAY['Continúa con el siguiente ejercicio', 'Explora más sobre scope de variables'],
  'Tu respuesta demuestra una comprensión clara de la diferencia entre let y const. let permite reasignación de valores, mientras que const crea una referencia inmutable.'
FROM public.users u
WHERE random() < 0.1;

-- Crear función para generar datos de prueba más realistas
CREATE OR REPLACE FUNCTION public.generate_realistic_ai_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  topics TEXT[] := ARRAY['variables', 'functions', 'arrays', 'objects', 'async-await', 'promises', 'closures'];
  skill_levels TEXT[] := ARRAY['beginner', 'intermediate'];
  services TEXT[] := ARRAY['content_generation', 'exercise_evaluation', 'placement_analysis', 'learning_path_generation'];
  models TEXT[] := ARRAY['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
BEGIN
  -- Generar logs de uso más realistas para cada usuario
  FOR user_record IN SELECT id FROM public.users WHERE ai_enabled = TRUE LOOP
    -- Generar 5-15 logs por usuario en los últimos 30 días
    FOR i IN 1..(floor(random() * 10 + 5)::INTEGER) LOOP
      INSERT INTO public.ai_usage_logs (
        user_id, 
        service_type, 
        model_used, 
        tokens_used, 
        cost_estimate, 
        processing_time, 
        success, 
        metadata,
        created_at
      ) VALUES (
        user_record.id,
        services[floor(random() * array_length(services, 1) + 1)],
        models[floor(random() * array_length(models, 1) + 1)],
        floor(random() * 1000 + 100)::INTEGER,
        (floor(random() * 1000 + 100) * 0.00003)::DECIMAL(10, 6),
        floor(random() * 3000 + 500)::INTEGER,
        random() > 0.05, -- 95% success rate
        jsonb_build_object(
          'topic', topics[floor(random() * array_length(topics, 1) + 1)],
          'skill_level', skill_levels[floor(random() * array_length(skill_levels, 1) + 1)]
        ),
        NOW() - (random() * INTERVAL '30 days')
      );
    END LOOP;
    
    -- Actualizar estadísticas del usuario
    UPDATE public.users 
    SET 
      total_ai_tokens_used = (
        SELECT COALESCE(SUM(tokens_used), 0) 
        FROM public.ai_usage_logs 
        WHERE user_id = user_record.id
      ),
      ai_usage_count = (
        SELECT COUNT(*) 
        FROM public.ai_usage_logs 
        WHERE user_id = user_record.id
      ),
      last_ai_interaction = (
        SELECT MAX(created_at) 
        FROM public.ai_usage_logs 
        WHERE user_id = user_record.id
      )
    WHERE id = user_record.id;
  END LOOP;
END;
$$;

-- Ejecutar la función para generar datos realistas (opcional)
-- SELECT public.generate_realistic_ai_data();

-- Crear función para limpiar datos de prueba
CREATE OR REPLACE FUNCTION public.cleanup_test_ai_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Limpiar todos los datos de IA de prueba
  DELETE FROM public.ai_usage_logs WHERE cost_estimate < 0.01; -- Datos de prueba tienen costos muy bajos
  DELETE FROM public.adaptive_progress WHERE difficulty_adjustment = 1.0; -- Datos de prueba
  DELETE FROM public.placement_analysis WHERE personalized_advice LIKE '%ejemplo%';
  DELETE FROM public.learning_paths WHERE title LIKE '%Ejemplo%';
  DELETE FROM public.generated_content WHERE content_type = 'lesson' AND created_at > NOW() - INTERVAL '1 hour';
  DELETE FROM public.generated_exercises WHERE is_completed = false AND created_at > NOW() - INTERVAL '1 hour';
  DELETE FROM public.exercise_evaluations WHERE score = 95; -- Datos de ejemplo específicos
END;
$$;

-- Comentarios finales
COMMENT ON FUNCTION public.generate_realistic_ai_data() IS 'Genera datos de prueba realistas para el sistema de IA';
COMMENT ON FUNCTION public.cleanup_test_ai_data() IS 'Limpia los datos de prueba del sistema de IA';
