// API route to seed the database with placement test questions
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (optional: add admin check)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear existing questions
    const { error: deleteError } = await supabase
      .from("placement_questions")
      .delete()
      .neq("id", "never-match"); // Delete all rows

    if (deleteError) {
      console.error("Error clearing questions:", deleteError);
      return NextResponse.json(
        { error: "Failed to clear existing questions" },
        { status: 500 }
      );
    }

    // Insert modern JavaScript questions
    const questions = [
      // BEGINNER LEVEL
      {
        question: "¿Cuál es la diferencia principal entre let y var?",
        options: JSON.stringify([
          "let tiene scope de función, var tiene scope de bloque",
          "let tiene scope de bloque, var tiene scope de función",
          "No hay diferencia",
          "let es más lento que var"
        ]),
        correct_answer: "let tiene scope de bloque, var tiene scope de función",
        difficulty_level: "beginner",
        points: 1,
        explanation:
          "let introduce block scope, mientras que var tiene function scope, evitando muchos problemas comunes."
      },
      {
        question: "¿Cómo se declara una función arrow en JavaScript?",
        options: JSON.stringify([
          "const func = () => {}",
          "function func() => {}",
          "const func => () {}",
          "func => () => {}"
        ]),
        correct_answer: "const func = () => {}",
        difficulty_level: "beginner",
        points: 1,
        explanation:
          "Las arrow functions se declaran con la sintaxis const nombre = () => {}."
      },
      {
        question:
          "¿Qué hace el operador de destructuring en este código: const {name, age} = person?",
        options: JSON.stringify([
          "Crea un objeto",
          "Extrae propiedades del objeto person",
          "Elimina propiedades",
          "Compara objetos"
        ]),
        correct_answer: "Extrae propiedades del objeto person",
        difficulty_level: "beginner",
        points: 1,
        explanation:
          "Destructuring permite extraer propiedades de objetos o elementos de arrays de forma concisa."
      },
      {
        question:
          '¿Cuál es el resultado de `Hello ${name}` donde name = "World"?',
        options: JSON.stringify([
          "Hello ${name}",
          "Hello World",
          "Hello name",
          "Error"
        ]),
        correct_answer: "Hello World",
        difficulty_level: "beginner",
        points: 1,
        explanation:
          "Template literals (backticks) permiten interpolación de variables con ${}."
      },
      {
        question: "¿Qué hace const en JavaScript?",
        options: JSON.stringify([
          "Crea una variable que nunca cambia",
          "Crea una variable inmutable",
          "Previene la reasignación de la variable",
          "Es igual que var"
        ]),
        correct_answer: "Previene la reasignación de la variable",
        difficulty_level: "beginner",
        points: 1,
        explanation:
          "const previene la reasignación, pero el contenido de objetos/arrays puede mutar."
      },
      {
        question: "¿Cómo se importa una función por defecto en ES6 modules?",
        options: JSON.stringify([
          'import {func} from "./module"',
          'import func from "./module"',
          'import * as func from "./module"',
          'require("./module")'
        ]),
        correct_answer: 'import func from "./module"',
        difficulty_level: "beginner",
        points: 1,
        explanation:
          'Las exportaciones por defecto se importan sin llaves: import nombre from "ruta".'
      },
      // INTERMEDIATE LEVEL
      {
        question:
          "¿Qué devuelve una función async que no tiene return explícito?",
        options: JSON.stringify([
          "undefined",
          "null",
          "Promise<undefined>",
          "Error"
        ]),
        correct_answer: "Promise<undefined>",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "Las funciones async siempre devuelven una Promise, incluso sin return explícito."
      },
      {
        question:
          "¿Cuál es la diferencia entre Promise.all() y Promise.allSettled()?",
        options: JSON.stringify([
          "No hay diferencia",
          "all() se rechaza si una falla, allSettled() espera todas",
          "allSettled() es más rápido",
          "all() maneja errores mejor"
        ]),
        correct_answer:
          "all() se rechaza si una falla, allSettled() espera todas",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "Promise.all falla rápido, Promise.allSettled espera todas las promesas sin importar el resultado."
      },
      {
        question:
          "¿Qué hace el operador nullish coalescing (??) en JavaScript?",
        options: JSON.stringify([
          "Igual que ||",
          "Devuelve el lado derecho solo si el izquierdo es null o undefined",
          "Compara valores",
          "Es un operador ternario"
        ]),
        correct_answer:
          "Devuelve el lado derecho solo si el izquierdo es null o undefined",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          'El operador ?? solo considera null y undefined como falsy, no otros valores como 0 o "".'
      },
      {
        question: "¿Cuál es el resultado de [...[1, 2], ...[3, 4]]?",
        options: JSON.stringify([
          "[1, 2, 3, 4]",
          "[[1, 2], [3, 4]]",
          "[1, 2], [3, 4]",
          "Error"
        ]),
        correct_answer: "[1, 2, 3, 4]",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "El spread operator (...) expande arrays, combinándolos en uno solo."
      },
      {
        question: "¿Qué es optional chaining (?.) en JavaScript?",
        options: JSON.stringify([
          "Un operador para arrays",
          "Permite acceder a propiedades sin error si son undefined",
          "Un tipo de loop",
          "Una función built-in"
        ]),
        correct_answer:
          "Permite acceder a propiedades sin error si son undefined",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "Optional chaining (?.) permite acceder a propiedades anidadas sin errores si algún nivel es null/undefined."
      },
      {
        question: "¿Cuál es la diferencia entre map() y forEach()?",
        options: JSON.stringify([
          "No hay diferencia",
          "map() devuelve un nuevo array, forEach() no",
          "forEach() es más rápido",
          "map() modifica el array original"
        ]),
        correct_answer: "map() devuelve un nuevo array, forEach() no",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "map() transforma elementos y devuelve un nuevo array, forEach() solo itera sin retornar."
      },
      // INTERMEDIATE LEVEL (Additional concepts)
      {
        question: "¿Cuál es la diferencia entre for...in y for...of?",
        options: JSON.stringify([
          "No hay diferencia",
          "for...in itera índices/claves, for...of itera valores",
          "for...of es más lento",
          "for...in es para objetos, for...of para arrays"
        ]),
        correct_answer: "for...in itera índices/claves, for...of itera valores",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "for...in itera propiedades enumerables, for...of itera valores de iterables."
      },
      {
        question: "¿Qué hace Object.freeze()?",
        options: JSON.stringify([
          "Congela el navegador",
          "Hace un objeto inmutable superficialmente",
          "Elimina un objeto",
          "Copia un objeto"
        ]),
        correct_answer: "Hace un objeto inmutable superficialmente",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "Object.freeze() previene modificaciones a las propiedades del primer nivel del objeto."
      },
      {
        question: "¿Cuál es el resultado de [1, 2, 3].filter(x => x > 1)?",
        options: JSON.stringify(["[1, 2, 3]", "[2, 3]", "[1]", "error"]),
        correct_answer: "[2, 3]",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "filter() crea un nuevo array con elementos que pasan la condición."
      },
      {
        question:
          "¿Qué hace el operador de coalescencia nula (??) en JavaScript?",
        options: JSON.stringify([
          "Igual que ||",
          "Devuelve el lado derecho solo si el izquierdo es null o undefined",
          "Compara valores",
          "Es un operador ternario"
        ]),
        correct_answer:
          "Devuelve el lado derecho solo si el izquierdo es null o undefined",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          'El operador ?? solo considera null y undefined como falsy, no otros valores como 0 o "".'
      },
      {
        question: "¿Cuál es la diferencia entre call() y apply()?",
        options: JSON.stringify([
          "No hay diferencia",
          "call() acepta argumentos individuales, apply() acepta un array",
          "apply() es más rápido",
          "call() es para objetos, apply() para arrays"
        ]),
        correct_answer:
          "call() acepta argumentos individuales, apply() acepta un array",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "call() pasa argumentos individualmente, apply() los pasa como array."
      },
      {
        question: "¿Qué es una closure en JavaScript?",
        options: JSON.stringify([
          "Un tipo de loop",
          "Una función que tiene acceso a variables de su scope externo",
          "Un método de array",
          "Un operador"
        ]),
        correct_answer:
          "Una función que tiene acceso a variables de su scope externo",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "Una closure permite que una función acceda a variables de su scope léxico externo."
      },
      {
        question: "¿Cuál es el resultado de 0.1 + 0.2 === 0.3 en JavaScript?",
        options: JSON.stringify(["true", "false", "undefined", "error"]),
        correct_answer: "false",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "Debido a la precisión de punto flotante, 0.1 + 0.2 no es exactamente 0.3."
      },
      {
        question: "¿Qué hace el operador spread (...) con objetos?",
        options: JSON.stringify([
          "Los elimina",
          "Crea una copia superficial",
          "Los convierte en array",
          "Causa un error"
        ]),
        correct_answer: "Crea una copia superficial",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "El operador spread crea una copia superficial de las propiedades del objeto."
      },
      {
        question:
          "¿Cuál es la diferencia entre JSON.stringify() y JSON.parse()?",
        options: JSON.stringify([
          "No hay diferencia",
          "stringify convierte a string, parse convierte de string",
          "parse es más rápido",
          "stringify es para objetos, parse para arrays"
        ]),
        correct_answer:
          "stringify convierte a string, parse convierte de string",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "JSON.stringify() serializa objetos a JSON string, JSON.parse() deserializa JSON string a objetos."
      },
      {
        question: "¿Qué hace el método Array.reduce()?",
        options: JSON.stringify([
          "Reduce el tamaño del array",
          "Combina todos los elementos en un solo valor",
          "Elimina elementos",
          "Ordena el array"
        ]),
        correct_answer: "Combina todos los elementos en un solo valor",
        difficulty_level: "intermediate",
        points: 2,
        explanation:
          "reduce() ejecuta una función reductora en cada elemento del array, resultando en un solo valor."
      }
    ];

    // Insert questions in batches
    const { error: insertError } = await supabase
      .from("placement_questions")
      .insert(questions);

    if (insertError) {
      console.error("Error inserting questions:", insertError);
      return NextResponse.json(
        { error: "Failed to insert questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${questions.length} placement test questions`,
      questionsCount: questions.length
    });
  } catch (error) {
    console.error("Database seeding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current questions count
    const { count, error } = await supabase
      .from("placement_questions")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to get questions count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questionsCount: count,
      message: `Database currently has ${count} placement test questions`
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
