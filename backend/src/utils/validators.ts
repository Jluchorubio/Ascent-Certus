export const isEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isNonEmpty = (value?: string) => {
  return typeof value === "string" && value.trim().length > 0;
};

export type NivelPregunta = "FACIL" | "MEDIO" | "ALTO";

export const isNivel = (value: unknown): value is NivelPregunta => {
  return value === "FACIL" || value === "MEDIO" || value === "ALTO";
};

export interface OpcionPregunta {
  id: number;
  texto: string;
  correcta: boolean;
}

export const validateOpciones = (opciones: unknown) => {
  if (!Array.isArray(opciones)) {
    return { valid: false, message: "Opciones debe ser un arreglo" };
  }

  if (opciones.length < 3 || opciones.length > 5) {
    return { valid: false, message: "Opciones debe tener entre 3 y 5 elementos" };
  }

  let correctas = 0;
  for (const opcion of opciones) {
    if (typeof opcion !== "object" || opcion === null) {
      return { valid: false, message: "Cada opción debe ser un objeto" };
    }

    const { id, texto, correcta } = opcion as OpcionPregunta;

    if (typeof id !== "number" || !Number.isInteger(id)) {
      return { valid: false, message: "Cada opción debe tener un id numérico" };
    }

    if (typeof texto !== "string" || texto.trim().length === 0) {
      return { valid: false, message: "Cada opción debe tener texto" };
    }

    if (typeof correcta !== "boolean") {
      return { valid: false, message: "Cada opción debe indicar si es correcta" };
    }

    if (correcta) {
      correctas += 1;
    }
  }

  if (correctas !== 1) {
    return { valid: false, message: "Debe existir exactamente una opción correcta" };
  }

  return { valid: true };
};
