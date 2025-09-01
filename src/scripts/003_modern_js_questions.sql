-- Modern JavaScript Placement Test Questions
-- This file contains updated questions covering modern JS features and best practices

-- Clear existing questions first
DELETE FROM public.placement_questions;

-- Insert comprehensive modern JavaScript questions
INSERT INTO public.placement_questions (question, options, correct_answer, difficulty_level, points, explanation) VALUES

-- BEGINNER LEVEL (ES6+ Basics)
('¿Cuál es la diferencia principal entre let y var?', 
 '["let tiene scope de función, var tiene scope de bloque", "let tiene scope de bloque, var tiene scope de función", "No hay diferencia", "let es más lento que var"]', 
 'let tiene scope de bloque, var tiene scope de función', 
 'beginner', 
 1, 
 'let introduce block scope, mientras que var tiene function scope, evitando muchos problemas comunes.'),

('¿Cómo se declara una función arrow en JavaScript?', 
 '["const func = () => {}", "function func() => {}", "const func => () {}", "func => () => {}"]', 
 'const func = () => {}', 
 'beginner', 
 1, 
 'Las arrow functions se declaran con la sintaxis const nombre = () => {}.'),

('¿Qué hace el operador de destructuring en este código: const {name, age} = person?', 
 '["Crea un objeto", "Extrae propiedades del objeto person", "Elimina propiedades", "Compara objetos"]', 
 'Extrae propiedades del objeto person', 
 'beginner', 
 1, 
 'Destructuring permite extraer propiedades de objetos o elementos de arrays de forma concisa.'),

('¿Cuál es el resultado de `Hello ${name}` donde name = "World"?', 
 '["Hello ${name}", "Hello World", "Hello name", "Error"]', 
 'Hello World', 
 'beginner', 
 1, 
 'Template literals (backticks) permiten interpolación de variables con ${}.'),

('¿Qué hace const en JavaScript?', 
 '["Crea una variable que nunca cambia", "Crea una variable inmutable", "Previene la reasignación de la variable", "Es igual que var"]', 
 'Previene la reasignación de la variable', 
 'beginner', 
 1, 
 'const previene la reasignación, pero el contenido de objetos/arrays puede mutar.'),

('¿Cómo se importa una función por defecto en ES6 modules?', 
 '["import {func} from \"./module\"", "import func from \"./module\"", "import * as func from \"./module\"", "require(\"./module\")"]', 
 'import func from "./module"', 
 'beginner', 
 1, 
 'Las exportaciones por defecto se importan sin llaves: import nombre from "ruta".'),

-- INTERMEDIATE LEVEL (Advanced ES6+, Async, etc.)
('¿Qué devuelve una función async que no tiene return explícito?', 
 '["undefined", "null", "Promise<undefined>", "Error"]', 
 'Promise<undefined>', 
 'intermediate', 
 2, 
 'Las funciones async siempre devuelven una Promise, incluso sin return explícito.'),

('¿Cuál es la diferencia entre Promise.all() y Promise.allSettled()?', 
 '["No hay diferencia", "all() se rechaza si una falla, allSettled() espera todas", "allSettled() es más rápido", "all() maneja errores mejor"]', 
 'all() se rechaza si una falla, allSettled() espera todas', 
 'intermediate', 
 2, 
 'Promise.all falla rápido, Promise.allSettled espera todas las promesas sin importar el resultado.'),

('¿Qué hace el operador nullish coalescing (??) en JavaScript?', 
 '["Igual que ||", "Devuelve el lado derecho solo si el izquierdo es null o undefined", "Compara valores", "Es un operador ternario"]', 
 'Devuelve el lado derecho solo si el izquierdo es null o undefined', 
 'intermediate', 
 2, 
 'El operador ?? solo considera null y undefined como falsy, no otros valores como 0 o "".'),

('¿Cuál es el resultado de [...[1, 2], ...[3, 4]]?', 
 '["[1, 2, 3, 4]", "[[1, 2], [3, 4]]", "[1, 2], [3, 4]", "Error"]', 
 '[1, 2, 3, 4]', 
 'intermediate', 
 2, 
 'El spread operator (...) expande arrays, combinándolos en uno solo.'),

('¿Qué es optional chaining (?.) en JavaScript?', 
 '["Un operador para arrays", "Permite acceder a propiedades sin error si son undefined", "Un tipo de loop", "Una función built-in"]', 
 'Permite acceder a propiedades sin error si son undefined', 
 'intermediate', 
 2, 
 'Optional chaining (?.) permite acceder a propiedades anidadas sin errores si algún nivel es null/undefined.'),

('¿Cuál es la diferencia entre map() y forEach()?', 
 '["No hay diferencia", "map() devuelve un nuevo array, forEach() no", "forEach() es más rápido", "map() modifica el array original"]', 
 'map() devuelve un nuevo array, forEach() no', 
 'intermediate', 
 2, 
 'map() transforma elementos y devuelve un nuevo array, forEach() solo itera sin retornar.'),

('¿Qué hace Object.freeze()?', 
 '["Congela el navegador", "Hace un objeto inmutable superficialmente", "Elimina un objeto", "Copia un objeto"]', 
 'Hace un objeto inmutable superficialmente', 
 'intermediate', 
 2, 
 'Object.freeze() previene modificaciones a las propiedades del primer nivel del objeto.'),

-- ADVANCED LEVEL (Modern patterns, performance, advanced concepts)
('¿Cuál es la diferencia entre microtasks y macrotasks en el Event Loop?', 
 '["No hay diferencia", "Microtasks tienen mayor prioridad que macrotasks", "Macrotasks son más rápidas", "Solo existe un tipo de task"]', 
 'Microtasks tienen mayor prioridad que macrotasks', 
 'advanced', 
 3, 
 'Microtasks (Promises) se ejecutan antes que macrotasks (setTimeout) en cada ciclo del Event Loop.'),

('¿Qué hace el método Array.from() con un segundo parámetro?', 
 '["Filtra elementos", "Aplica una función de mapeo a cada elemento", "Ordena el array", "Elimina duplicados"]', 
 'Aplica una función de mapeo a cada elemento', 
 'advanced', 
 3, 
 'Array.from(iterable, mapFn) combina conversión y mapeo en una sola operación.'),

('¿Cuál es el resultado de typeof (() => {}) en JavaScript?', 
 '["arrow", "function", "object", "undefined"]', 
 'function', 
 'advanced', 
 3, 
 'Las arrow functions son un tipo de función, por lo que typeof devuelve "function".'),

('¿Qué es un WeakMap y cuándo usarlo?', 
 '["Un Map más rápido", "Un Map con claves débilmente referenciadas", "Un Map inmutable", "No existe WeakMap"]', 
 'Un Map con claves débilmente referenciadas', 
 'advanced', 
 3, 
 'WeakMap permite que sus claves sean recolectadas por el garbage collector, útil para metadatos.'),

('¿Cuál es la diferencia entre for...in y for...of?', 
 '["No hay diferencia", "for...in itera índices/claves, for...of itera valores", "for...of es más lento", "for...in es para objetos, for...of para arrays"]', 
 'for...in itera índices/claves, for...of itera valores', 
 'advanced', 
 3, 
 'for...in itera propiedades enumerables, for...of itera valores de iterables.'),

('¿Qué hace Proxy en JavaScript?', 
 '["Crea una copia de objeto", "Intercepta y personaliza operaciones en objetos", "Es un patrón de diseño", "Conecta a internet"]', 
 'Intercepta y personaliza operaciones en objetos', 
 'advanced', 
 3, 
 'Proxy permite interceptar y redefinir operaciones como get, set, delete en objetos.'),

('¿Cuál es el propósito de Symbol en JavaScript?', 
 '["Crear números", "Crear identificadores únicos", "Crear strings", "Crear objetos"]', 
 'Crear identificadores únicos', 
 'advanced', 
 3, 
 'Symbol crea identificadores únicos, útiles para propiedades privadas y evitar colisiones.'),

('¿Qué es el patrón Module en JavaScript moderno?', 
 '["Una función", "Un sistema para encapsular y exportar código", "Un tipo de variable", "Un operador"]', 
 'Un sistema para encapsular y exportar código', 
 'advanced', 
 3, 
 'Los módulos ES6 proporcionan un sistema nativo para organizar y reutilizar código.'),

-- EXPERT LEVEL (Performance, advanced patterns, cutting-edge features)
('¿Cuál es la diferencia entre JSON.parse() y eval() para parsear JSON?', 
 '["No hay diferencia", "JSON.parse() es más seguro y rápido", "eval() es más seguro", "eval() solo funciona con arrays"]', 
 'JSON.parse() es más seguro y rápido', 
 'advanced', 
 3, 
 'JSON.parse() es específico para JSON, más seguro (no ejecuta código) y optimizado.'),

('¿Qué hace el operador instanceof con clases ES6?', 
 '["Crea instancias", "Verifica si un objeto es instancia de una clase", "Elimina instancias", "Copia instancias"]', 
 'Verifica si un objeto es instancia de una clase', 
 'advanced', 
 3, 
 'instanceof verifica la cadena de prototipos para determinar si un objeto es instancia de una clase.'),

('¿Cuál es el resultado de Promise.race([promise1, promise2])?', 
 '["El resultado de ambas promesas", "El resultado de la primera promesa que se resuelve", "Siempre un error", "Un array de resultados"]', 
 'El resultado de la primera promesa que se resuelve', 
 'advanced', 
 3, 
 'Promise.race devuelve el resultado de la primera promesa que se resuelve o rechaza.'),

('¿Qué son los Web Workers en JavaScript?', 
 '["Una librería", "Scripts que se ejecutan en background threads", "Un tipo de función", "Un patrón de diseño"]', 
 'Scripts que se ejecutan en background threads', 
 'advanced', 
 3, 
 'Web Workers permiten ejecutar JavaScript en threads separados sin bloquear el hilo principal.'),

('¿Cuál es la diferencia entre shallow copy y deep copy?', 
 '["No hay diferencia", "Shallow copia referencias, deep copia valores", "Deep es más rápido", "Shallow es para arrays, deep para objetos"]', 
 'Shallow copia referencias, deep copia valores', 
 'advanced', 
 3, 
 'Shallow copy copia solo el primer nivel, deep copy crea copias independientes de todos los niveles.'),

('¿Qué hace Object.defineProperty()?', 
 '["Elimina propiedades", "Define propiedades con descriptores específicos", "Copia propiedades", "Lista propiedades"]', 
 'Define propiedades con descriptores específicos', 
 'advanced', 
 3, 
 'Object.defineProperty() permite definir propiedades con control fino sobre configurabilidad, enumerabilidad, etc.');

