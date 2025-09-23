-- ========================================
-- JSENSEI - DATOS INICIALES
-- ========================================
-- Datos de ejemplo y configuración inicial para el sistema
-- Incluye preguntas de nivelación y contenido base

-- ========================================
-- 1. PREGUNTAS DE EXAMEN DE NIVELACIÓN
-- ========================================

-- Limpiar preguntas existentes
DELETE FROM public.placement_tests;

-- Insertar preguntas modernas de JavaScript
INSERT INTO public.placement_tests (question, options, correct_answer, explanation, topic, difficulty_level, points, is_active) VALUES

-- NIVEL PRINCIPIANTE
('¿Cuál es la diferencia principal entre let y var?', 
 '["let tiene scope de función, var tiene scope de bloque", "let tiene scope de bloque, var tiene scope de función", "No hay diferencia", "let es más lento que var"]', 
 'let tiene scope de bloque, var tiene scope de función', 
 'let introduce block scope, mientras que var tiene function scope, evitando muchos problemas comunes.',
 'variables', 'beginner', 1, true),

('¿Cómo se declara una función arrow en JavaScript?', 
 '["const func = () => {}", "function func() => {}", "const func => () {}", "func => () => {}"]', 
 'const func = () => {}', 
 'Las arrow functions se declaran con la sintaxis const nombre = () => {}.',
 'functions', 'beginner', 1, true),

('¿Qué hace el operador de destructuring en este código: const {name, age} = person?', 
 '["Crea un objeto", "Extrae propiedades del objeto person", "Elimina propiedades", "Compara objetos"]', 
 'Extrae propiedades del objeto person', 
 'Destructuring permite extraer propiedades de objetos o elementos de arrays de forma concisa.',
 'objects', 'beginner', 1, true),

('¿Cuál es el resultado de `Hello ${name}` donde name = "World"?', 
 '["Hello ${name}", "Hello World", "Hello name", "Error"]', 
 'Hello World', 
 'Template literals (backticks) permiten interpolación de variables con ${}.',
 'template-literals', 'beginner', 1, true),

('¿Qué hace const en JavaScript?', 
 '["Crea una variable que nunca cambia", "Crea una variable inmutable", "Previene la reasignación de la variable", "Es igual que var"]', 
 'Previene la reasignación de la variable', 
 'const previene la reasignación, pero el contenido de objetos/arrays puede mutar.',
 'variables', 'beginner', 1, true),

('¿Cómo se importa una función por defecto en ES6 modules?', 
 '["import {func} from \"./module\"", "import func from \"./module\"", "import * as func from \"./module\"", "require(\"./module\")"]', 
 'import func from "./module"', 
 'Las exportaciones por defecto se importan sin llaves: import nombre from "ruta".',
 'modules', 'beginner', 1, true),

('¿Cuál es la diferencia entre == y === en JavaScript?', 
 '["No hay diferencia", "== compara valor, === compara valor y tipo", "=== es más rápido", "== es para números, === para strings"]', 
 '== compara valor, === compara valor y tipo', 
 '== realiza coerción de tipos, mientras que === compara valor y tipo sin coerción.',
 'operators', 'beginner', 1, true),

('¿Qué devuelve typeof null en JavaScript?', 
 '["null", "undefined", "object", "error"]', 
 'object', 
 'Es un bug histórico de JavaScript que typeof null devuelve "object".',
 'types', 'beginner', 1, true),

('¿Cuál es el resultado de [1, 2, 3].map(x => x * 2)?', 
 '["[1, 2, 3]", "[2, 4, 6]", "6", "error"]', 
 '[2, 4, 6]', 
 'map() crea un nuevo array aplicando la función a cada elemento.',
 'arrays', 'beginner', 1, true),

('¿Qué es el "hoisting" en JavaScript?', 
 '["Un error de sintaxis", "El proceso de elevar declaraciones al inicio del scope", "Una función built-in", "Un tipo de loop"]', 
 'El proceso de elevar declaraciones al inicio del scope', 
 'Hoisting es el comportamiento de JavaScript de mover declaraciones al inicio de su scope.',
 'scope', 'beginner', 1, true),

-- NIVEL INTERMEDIO
('¿Qué devuelve una función async que no tiene return explícito?', 
 '["undefined", "null", "Promise<undefined>", "Error"]', 
 'Promise<undefined>', 
 'Las funciones async siempre devuelven una Promise, incluso sin return explícito.',
 'async-await', 'intermediate', 2, true),

('¿Cuál es la diferencia entre Promise.all() y Promise.allSettled()?', 
 '["No hay diferencia", "all() se rechaza si una falla, allSettled() espera todas", "allSettled() es más rápido", "all() maneja errores mejor"]', 
 'all() se rechaza si una falla, allSettled() espera todas', 
 'Promise.all falla rápido, Promise.allSettled espera todas las promesas sin importar el resultado.',
 'promises', 'intermediate', 2, true),

('¿Qué hace el operador nullish coalescing (??) en JavaScript?', 
 '["Igual que ||", "Devuelve el lado derecho solo si el izquierdo es null o undefined", "Compara valores", "Es un operador ternario"]', 
 'Devuelve el lado derecho solo si el izquierdo es null o undefined', 
 'El operador ?? solo considera null y undefined como falsy, no otros valores como 0 o "".',
 'operators', 'intermediate', 2, true),

('¿Cuál es el resultado de [...[1, 2], ...[3, 4]]?', 
 '["[1, 2, 3, 4]", "[[1, 2], [3, 4]]", "[1, 2], [3, 4]", "Error"]', 
 '[1, 2, 3, 4]', 
 'El spread operator (...) expande arrays, combinándolos en uno solo.',
 'arrays', 'intermediate', 2, true),

('¿Qué es optional chaining (?.) en JavaScript?', 
 '["Un operador para arrays", "Permite acceder a propiedades sin error si son undefined", "Un tipo de loop", "Una función built-in"]', 
 'Permite acceder a propiedades sin error si son undefined', 
 'Optional chaining (?.) permite acceder a propiedades anidadas sin errores si algún nivel es null/undefined.',
 'objects', 'intermediate', 2, true),

('¿Cuál es la diferencia entre map() y forEach()?', 
 '["No hay diferencia", "map() devuelve un nuevo array, forEach() no", "forEach() es más rápido", "map() modifica el array original"]', 
 'map() devuelve un nuevo array, forEach() no', 
 'map() transforma elementos y devuelve un nuevo array, forEach() solo itera sin retornar.',
 'arrays', 'intermediate', 2, true),

('¿Qué hace Object.freeze()?', 
 '["Congela el navegador", "Hace un objeto inmutable superficialmente", "Elimina un objeto", "Copia un objeto"]', 
 'Hace un objeto inmutable superficialmente', 
 'Object.freeze() previene modificaciones a las propiedades del primer nivel del objeto.',
 'objects', 'intermediate', 2, true),

('¿Cuál es la diferencia entre for...in y for...of?', 
 '["No hay diferencia", "for...in itera índices/claves, for...of itera valores", "for...of es más lento", "for...in es para objetos, for...of para arrays"]', 
 'for...in itera índices/claves, for...of itera valores', 
 'for...in itera propiedades enumerables, for...of itera valores de iterables.',
 'loops', 'intermediate', 2, true),

('¿Qué es una closure en JavaScript?', 
 '["Un tipo de loop", "Una función que tiene acceso a variables de su scope externo", "Un método de array", "Un operador"]', 
 'Una función que tiene acceso a variables de su scope externo', 
 'Una closure permite que una función acceda a variables de su scope léxico externo.',
 'closures', 'intermediate', 2, true),

('¿Cuál es el resultado de 0.1 + 0.2 === 0.3 en JavaScript?', 
 '["true", "false", "undefined", "error"]', 
 'false', 
 'Debido a la precisión de punto flotante, 0.1 + 0.2 no es exactamente 0.3.',
 'numbers', 'intermediate', 2, true),

-- NIVEL AVANZADO
('¿Qué es el Event Loop en JavaScript?', 
 '["Un tipo de bucle", "El mecanismo que maneja la ejecución asíncrona", "Una función built-in", "Un patrón de diseño"]', 
 'El mecanismo que maneja la ejecución asíncrona', 
 'El Event Loop es el mecanismo que permite a JavaScript manejar operaciones asíncronas en un hilo único.',
 'async', 'advanced', 3, true),

('¿Cuál es la diferencia entre call(), apply() y bind()?', 
 '["No hay diferencia", "call() y apply() ejecutan inmediatamente, bind() devuelve una nueva función", "bind() es más rápido", "apply() solo funciona con arrays"]', 
 'call() y apply() ejecutan inmediatamente, bind() devuelve una nueva función', 
 'call() y apply() invocan la función inmediatamente, bind() crea una nueva función con el contexto establecido.',
 'functions', 'advanced', 3, true),

('¿Qué es el patrón Module en JavaScript?', 
 '["Un tipo de función", "Un patrón para encapsular código y crear scope privado", "Una librería", "Un operador"]', 
 'Un patrón para encapsular código y crear scope privado', 
 'El patrón Module permite crear scope privado y exponer solo las partes necesarias del código.',
 'patterns', 'advanced', 3, true);

-- ========================================
-- 2. CONTENIDO BASE DEL SISTEMA
-- ========================================

-- Insertar algunos ejemplos de contenido global (no específico de usuario)
INSERT INTO public.content_items (
  title, description, topic, content_type, skill_level, content, 
  estimated_duration, order_index, is_generated_by_ai, is_active
) VALUES

-- Lección básica de variables
('Variables en JavaScript', 
 'Aprende los fundamentos de las variables en JavaScript moderno',
 'variables', 'lesson', 'beginner',
 '{
   "sections": [
     {
       "title": "Introducción a las Variables",
       "content": "Las variables son contenedores que almacenan datos. En JavaScript moderno, tenemos tres formas principales de declarar variables: let, const y var.",
       "examples": [
         {
           "title": "Declaración con let",
           "code": "let nombre = \"Juan\";\nlet edad = 25;\nconsole.log(nombre, edad);",
           "explanation": "let permite declarar variables que pueden cambiar su valor"
         },
         {
           "title": "Declaración con const",
           "code": "const PI = 3.14159;\nconst usuario = { nombre: \"Ana\", edad: 30 };\nconsole.log(PI, usuario);",
           "explanation": "const declara constantes que no pueden ser reasignadas"
         }
       ]
     },
     {
       "title": "Scope de Variables",
       "content": "El scope determina dónde una variable puede ser accedida en tu código.",
       "examples": [
         {
           "title": "Block Scope con let",
           "code": "if (true) {\n  let mensaje = \"Hola\";\n  console.log(mensaje); // Funciona\n}\n// console.log(mensaje); // Error!",
           "explanation": "let tiene block scope - solo existe dentro del bloque donde se declara"
         }
       ]
     }
   ],
   "exercises": [
     {
       "id": "var-ex-1",
       "question": "Declara una variable llamada \"miNombre\" usando let y asígnale tu nombre",
       "type": "code-completion",
       "expectedAnswer": "let miNombre = ",
       "hints": ["Usa la palabra clave let", "No olvides las comillas para el string"]
     }
   ]
 }',
 45, 1, false, true),

-- Lección de funciones arrow
('Funciones Arrow', 
 'Domina la sintaxis moderna de funciones en JavaScript',
 'functions', 'lesson', 'beginner',
 '{
   "sections": [
     {
       "title": "Sintaxis de Arrow Functions",
       "content": "Las arrow functions son una forma más concisa de escribir funciones en JavaScript.",
       "examples": [
         {
           "title": "Función tradicional vs Arrow",
           "code": "// Función tradicional\nfunction saludar(nombre) {\n  return \"Hola \" + nombre;\n}\n\n// Arrow function\nconst saludar = (nombre) => {\n  return \"Hola \" + nombre;\n};\n\n// Arrow function simplificada\nconst saludar = nombre => \"Hola \" + nombre;",
           "explanation": "Las arrow functions pueden ser más concisas, especialmente para funciones simples"
         }
       ]
     }
   ],
   "exercises": [
     {
       "id": "arrow-ex-1",
       "question": "Convierte esta función tradicional a arrow function: function doblar(x) { return x * 2; }",
       "type": "code-completion",
       "expectedAnswer": "const doblar = x => x * 2;",
       "hints": ["Usa const para declarar la arrow function", "Puedes omitir los paréntesis si solo hay un parámetro"]
     }
   ]
 }',
 35, 2, false, true),

-- Ejercicio de arrays
('Métodos de Arrays', 
 'Practica con los métodos más importantes de arrays',
 'arrays', 'exercise', 'intermediate',
 '{
   "instructions": "Completa los siguientes ejercicios usando métodos de arrays como map, filter, reduce.",
   "exercises": [
     {
       "id": "array-ex-1",
       "question": "Usa map() para duplicar todos los números en el array [1, 2, 3, 4]",
       "type": "code-completion",
       "expectedAnswer": "[1, 2, 3, 4].map(x => x * 2)",
       "hints": ["map() transforma cada elemento", "Usa una arrow function para multiplicar por 2"]
     },
     {
       "id": "array-ex-2", 
       "question": "Usa filter() para obtener solo los números pares de [1, 2, 3, 4, 5, 6]",
       "type": "code-completion",
       "expectedAnswer": "[1, 2, 3, 4, 5, 6].filter(x => x % 2 === 0)",
       "hints": ["filter() mantiene elementos que cumplen una condición", "Usa el operador módulo % para verificar si es par"]
     }
   ]
 }',
 25, 3, false, true);

-- ========================================
-- 3. FUNCIONES ÚTILES PARA EL SISTEMA
-- ========================================

-- Función para obtener estadísticas de usuario
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  skill_level TEXT,
  total_points INTEGER,
  streak_days INTEGER,
  placement_completed BOOLEAN,
  placement_score INTEGER,
  active_learning_paths INTEGER,
  completed_content INTEGER,
  total_interactions INTEGER,
  ai_tokens_used INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.skill_level,
    up.total_points,
    up.streak_days,
    up.placement_test_completed,
    up.placement_test_score,
    (SELECT COUNT(*)::INTEGER FROM public.learning_paths WHERE user_id = user_uuid AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM public.user_progress WHERE user_id = user_uuid AND status = 'completed'),
    (SELECT COUNT(*)::INTEGER FROM public.user_interactions WHERE user_id = user_uuid),
    up.total_ai_tokens_used,
    up.last_activity_date
  FROM public.user_profiles up
  WHERE up.user_id = user_uuid;
END;
$$;

-- Función para obtener progreso de learning path
CREATE OR REPLACE FUNCTION public.get_learning_path_progress(path_uuid UUID)
RETURNS TABLE (
  total_items INTEGER,
  completed_items INTEGER,
  progress_percentage REAL,
  current_topic TEXT,
  next_topic TEXT,
  estimated_remaining_time INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.content_items WHERE learning_path_id = path_uuid),
    (SELECT COUNT(*)::INTEGER FROM public.user_progress WHERE learning_path_id = path_uuid AND status = 'completed'),
    lp.progress_percentage,
    (SELECT topic FROM public.user_progress WHERE learning_path_id = path_uuid AND status = 'in_progress' LIMIT 1),
    (SELECT topic FROM public.user_progress WHERE learning_path_id = path_uuid AND status = 'not_started' ORDER BY created_at LIMIT 1),
    (SELECT SUM(estimated_duration)::INTEGER FROM public.content_items WHERE learning_path_id = path_uuid AND id NOT IN (
      SELECT content_item_id FROM public.user_progress WHERE learning_path_id = path_uuid AND status = 'completed'
    ))
  FROM public.learning_paths lp
  WHERE lp.id = path_uuid;
END;
$$;

-- Función para limpiar datos antiguos (GDPR compliance)
CREATE OR REPLACE FUNCTION public.cleanup_user_data(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eliminar todos los datos del usuario
  DELETE FROM public.ai_sessions WHERE user_id = user_uuid;
  DELETE FROM public.user_interactions WHERE user_id = user_uuid;
  DELETE FROM public.user_progress WHERE user_id = user_uuid;
  DELETE FROM public.content_items WHERE user_id = user_uuid;
  DELETE FROM public.learning_paths WHERE user_id = user_uuid;
  DELETE FROM public.user_profiles WHERE user_id = user_uuid;
  DELETE FROM public.users WHERE id = user_uuid;
END;
$$;

-- ========================================
-- 4. VISTAS ÚTILES
-- ========================================

-- Vista de estadísticas generales del sistema
CREATE OR REPLACE VIEW public.system_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.user_profiles WHERE placement_test_completed = true) as users_with_placement,
  (SELECT COUNT(*) FROM public.learning_paths WHERE is_active = true) as active_learning_paths,
  (SELECT COUNT(*) FROM public.content_items WHERE is_active = true) as total_content_items,
  (SELECT COUNT(*) FROM public.content_items WHERE is_generated_by_ai = true) as ai_generated_content,
  (SELECT AVG(total_points) FROM public.user_profiles) as avg_user_points,
  (SELECT SUM(total_ai_tokens_used) FROM public.user_profiles) as total_ai_tokens_used;

-- Vista de actividad reciente
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT 
  'interaction' as activity_type,
  ui.user_id,
  u.display_name,
  ui.interaction_type as details,
  ui.created_at
FROM public.user_interactions ui
JOIN public.users u ON ui.user_id = u.id
WHERE ui.created_at > NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'ai_session' as activity_type,
  ai.user_id,
  u.display_name,
  ai.service_type as details,
  ai.created_at
FROM public.ai_sessions ai
JOIN public.users u ON ai.user_id = u.id
WHERE ai.created_at > NOW() - INTERVAL '7 days'

ORDER BY created_at DESC
LIMIT 100;

-- ========================================
-- COMENTARIOS FINALES
-- ========================================

COMMENT ON FUNCTION public.get_user_stats(UUID) IS 'Obtiene estadísticas completas de un usuario';
COMMENT ON FUNCTION public.get_learning_path_progress(UUID) IS 'Obtiene el progreso de un learning path específico';
COMMENT ON FUNCTION public.cleanup_user_data(UUID) IS 'Elimina todos los datos de un usuario (GDPR compliance)';
COMMENT ON VIEW public.system_stats IS 'Estadísticas generales del sistema JSensei';
COMMENT ON VIEW public.recent_activity IS 'Actividad reciente de usuarios en el sistema';
