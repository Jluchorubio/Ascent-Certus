export type Nivel = 1 | 2 | 3;

export interface AdaptiveState {
  nivelActual: Nivel;
  incorrectasConsecutivas: number;
}

export const inicialState = (): AdaptiveState => ({
  nivelActual: 2,
  incorrectasConsecutivas: 0,
});

export const siguienteNivel = (state: AdaptiveState, fueCorrecta: boolean): AdaptiveState => {
  if (fueCorrecta) {
    return {
      nivelActual: (Math.min(3, state.nivelActual + 1) as Nivel),
      incorrectasConsecutivas: 0,
    };
  }

  const nuevasIncorrectas = state.incorrectasConsecutivas + 1;
  if (nuevasIncorrectas >= 2) {
    return {
      nivelActual: (Math.max(1, state.nivelActual - 1) as Nivel),
      incorrectasConsecutivas: 0,
    };
  }

  return {
    nivelActual: state.nivelActual,
    incorrectasConsecutivas: nuevasIncorrectas,
  };
};
