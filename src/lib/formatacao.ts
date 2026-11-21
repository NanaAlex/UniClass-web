// Fuso fixo para o servidor e o navegador renderizarem a mesma data.
const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatarData(iso: string) {
  return formatoData.format(new Date(iso));
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/** Para buscas que ignoram acento e maiúsculas: "matematica" encontra "Matemática". */
export function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/** "16 de out. de 2026, 11:22" */
export function formatarDataHora(iso: string) {
  return formatoDataHora.format(new Date(iso));
}

/** "11987654321" -> "(11) 98765-4321"; "1133334444" -> "(11) 3333-4444". Outros tamanhos ficam como vieram. */
export function formatarTelefone(digitos: string) {
  const d = digitos.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}
