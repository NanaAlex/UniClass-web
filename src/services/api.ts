const URL_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

const CHAVE_TOKEN = "staggy_token";

/* 
   Token da sessão
   Fica no localStorage do navegador para continuar valendo
   depois de recarregar a página. O "typeof window" evita erro
   quando o Next.js monta a página no servidor, onde não existe
   localStorage.
*/
export function salvarToken(token: string) {
    localStorage.setItem(CHAVE_TOKEN, token);
}

export function obterToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CHAVE_TOKEN);
}

export function apagarToken() {
    localStorage.removeItem(CHAVE_TOKEN);
}

/* 
   Erro devolvido pela API
   Guarda o código HTTP (401, 403, 404...) e a mensagem que o
   back mandou em { error: "..." }
 */
export class ErroApi extends Error {
    constructor(public status: number, mensagem: string) {
        super(mensagem);
        this.name = "ErroApi";
    }
}

/* 
   Faz uma requisição para o back-end
 */
export async function chamarApi<T>(
    caminho: string,
    opcoes: { method?: string; body?: unknown } = {},
): Promise<T> {
    // Cabeçalhos: JSON sempre, token quando existir
    const cabecalhos: Record<string, string> = { "Content-Type": "application/json" };
    const token = obterToken();
    if (token) cabecalhos.Authorization = `Bearer ${token}`;

    const resposta = await fetch(`${URL_API}${caminho}`, {
        method: opcoes.method ?? "GET",
        headers: cabecalhos,
        body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    });

    const dados = await resposta.json().catch(() => ({}));

    // Status fora da faixa 200–299: transforma em erro com a mensagem do back
    if (!resposta.ok) {
        throw new ErroApi(resposta.status, dados.error ?? "Erro ao comunicar com o servidor");
    }

    return dados as T;
}