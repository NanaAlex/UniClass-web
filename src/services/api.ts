export const URL_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const CHAVE_TOKEN = "staggy_token";

/* 
   Token da sessão
   Fica num cookie, e não no localStorage, porque os layouts
   rodam no servidor do Next, onde não existe localStorage.
   O navegador manda o cookie junto com cada página, então o
   servidor (services/usuarios.ts) e a página (aqui) conseguem
   ler o mesmo token. O "typeof document" evita erro quando o
   código roda no servidor. Validade: 1 dia (quem decide se a
   sessão ainda vale é o back, RF 1.11).
*/
export function salvarToken(token: string) {
    document.cookie = `${CHAVE_TOKEN}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function obterToken(): string | null {
    if (typeof document === "undefined") return null;
    // document.cookie vem como "nome1=valor1; nome2=valor2"
    const par = document.cookie.split("; ").find((item) => item.startsWith(`${CHAVE_TOKEN}=`));
    return par ? par.split("=")[1] : null;
}

export function apagarToken() {
    document.cookie = `${CHAVE_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
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

// Faz uma requisição para o back-end
export async function chamarApi<T>(
    caminho: string,
    opcoes: { method?: string; body?: unknown } = {},
): Promise<T> {
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