import { mapearExecucao } from "@/lib/geracao";
import type { Execucao, Trava } from "@/types";
import execucaoDemo from "./demo/execucaoDemo.json";

/**
 * Execuções do período 2027/1. A mais recente é a resposta real do motor Prolog para o conjunto de
 * demonstração (mocks/demo), gerada pelo script scripts/execucaoDemoFront.ts do backend no mesmo
 * formato de GET /admin/geracoes/:runId. A anterior mostra uma entrada rejeitada na pré-validação.
 */
export const execucoes: Execucao[] = [
  mapearExecucao(execucaoDemo),
  {
    id: "1d6b9e2a-0c55-4f7e-8b1d-2027a0000000",
    periodoLetivo: "2027/1",
    status: "ENTRADA_INVALIDA",
    iniciadaEm: "2026-11-04T17:02:00Z",
    concluidaEm: "2026-11-04T17:02:01Z",
    publicadaEm: null,
    gradeBaseId: null,
    simulada: false,
    aulasPorBloco: 2,
    painel: {
      totalTurmas: null,
      turmasComGradeValidada: null,
      professoresComAulas: null,
      participantes: null,
      professoresAtivos: 10,
      respostasEnviadas: 7,
      pendentes: 3,
      geracaoAntecipadaConfirmada: true,
      custoTotal: null,
      parcelas: null,
      piorMedia: null,
      amplitude: null,
      duracaoSegundos: 0.4,
      tempoPrimeiraGradeSegundos: null,
      limiteSegundos: 600,
      motivoTermino: "ENTRADA_INVALIDA",
      provas: null,
      justificativa: {
        titulo: "Dados de entrada rejeitados",
        texto: "A geração não foi executada porque os dados abaixo foram rejeitados na pré-validação. Não houve falha de otimização.",
        niveisComprovados: [],
        niveisNaoComprovados: [1, 2, 3, 4],
      },
      diagnosticos: [
        {
          codigo: "CARGA_INCOMPATIVEL_COM_K",
          categoria: "entrada_invalida",
          severidade: "erro",
          etapa: "pre_validacao_backend",
          mensagem: "Carga de 3 aulas não é múltipla de K=2 (RN-13, CA-16)",
          natureza: "comprovada",
          entidades: { disciplina_id: "fsi", carga_aulas: 3, K: 2 },
        },
      ],
      publicavel: false,
    },
    grade: null,
    travasAplicadas: [],
  },
];

/** Travas do período 2027/1 (expiram ao iniciar outro período: RN-50). */
export const travasDoPeriodo: Trava[] = [];
