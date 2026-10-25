// Simula a latência de uma API. Ao trocar pelos endpoints reais, só os services mudam.
const ATRASO_PADRAO_MS = 350;

export function esperar(ms = ATRASO_PADRAO_MS) {
  return new Promise<void>((resolver) => setTimeout(resolver, ms));
}

/** Devolve uma cópia para que as telas não alterem os mocks por referência. */
export async function responder<T>(dados: T, ms?: number): Promise<T> {
  await esperar(ms);
  return structuredClone(dados);
}

export class ErroNaoEncontrado extends Error {
  constructor(recurso: string, id: string) {
    super(`${recurso} "${id}" não encontrado(a).`);
    this.name = "ErroNaoEncontrado";
  }
}
