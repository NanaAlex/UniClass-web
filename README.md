# 🌐 Web

Front-end web construído com **Next.js** + **TypeScript**.

# Relatório Jira e Diagramas
https://drive.google.com/drive/folders/11swJExn4jfPuFHDg00saQOlSUQaMkUy3?usp=drive_link

## Tecnologias

- [Next.js 14](https://nextjs.org/)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## Como rodar

### Pré-requisitos
- Node.js 18+
- Back-end rodando

### Instalação

```bash
# Clone o repositório
git clone https://github.com/NanaAlex/sistema-escolar-web.git
cd web

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com a URL da sua API

# Rode em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build para produção

```bash
npm run build
npm start
```

## Estrutura de pastas

```
public/
└── icons/                                  # Ícones do projeto e logo

src/
├── app/
│   ├── layout.tsx                          # Layout raiz da aplicação
│   ├── page.tsx                            # Redireciona para /login
│   ├── (auth)/                             # Telas sem menu lateral
│   │   ├── layout.tsx                      # Painel da marca + conteúdo
│   │   ├── layout.module.css
│   │   ├── login/page.tsx                  # Tela de login
│   │   └── recuperar-senha/page.tsx        # Tela de recuperar senha
│   ├── (admin)/admin/horarios/page.tsx     # Provisória: destino do login do administrador
│   └── (professor)/                        # Área do professor
│       ├── layout.tsx                      # Menu lateral + conteúdo
│       └── professor/
│           ├── horario/page.tsx            # Provisória: destino do login do professor
│           └── formulario/
│               ├── page.tsx                # Situação do formulário e solicitações
│               └── resposta/page.tsx       # Preencher, editar ou ver a resposta
├── components/
│   ├── autenticacao/
│   │   ├── Autenticacao.module.css
│   │   ├── FormularioLogin.tsx
│   │   ├── FormularioRecuperarSenha.tsx
│   │   ├── PainelMarca.tsx
│   │   └── PainelMarca.module.css
│   ├── compartilhados/                     # Usados por mais de uma área
│   │   ├── FiltroSemestre.tsx
│   │   ├── GradeDisponibilidade.tsx
│   │   ├── GradeDisponibilidade.module.css
│   │   └── TabelaDisponibilidade.tsx
│   ├── formulario/                         # Formulário do professor (com seus .module.css)
│   │   ├── AssistenteFormulario.tsx        # Preenchimento em etapas
│   │   ├── CartaoSituacaoFormulario.tsx
│   │   ├── ConteudoEtapa.tsx
│   │   ├── EscalaInteresse.tsx
│   │   ├── IndicadorEtapas.tsx
│   │   ├── ItemInteresseDisciplina.tsx
│   │   ├── ListaInteresseDisciplinas.tsx
│   │   ├── ModalConfirmarEnvio.tsx
│   │   ├── ModalSolicitarAlteracao.tsx
│   │   ├── PainelFormulario.tsx            # Situação do formulário e pedidos de alteração
│   │   ├── ResumoResposta.tsx
│   │   ├── SecaoSolicitacoesFormulario.tsx
│   │   ├── TabelaPrioridadePeriodo.tsx
│   │   ├── TelaRespostaFormulario.tsx
│   │   ├── useRespostaFormulario.ts
│   │   └── VisualizacaoResposta.tsx
│   ├── layout/                             # Estrutura das telas logadas (com seus .module.css)
│   │   ├── CabecalhoPagina.tsx
│   │   ├── CabecalhoSecao.tsx
│   │   ├── EstruturaPagina.tsx             # Menu lateral + área de conteúdo
│   │   ├── IconeMenu.tsx
│   │   ├── LinkVoltar.tsx
│   │   └── MenuLateral.tsx
│   ├── solicitacoes/                       # Pedidos de alteração
│   │   ├── EtiquetaStatusSolicitacao.tsx
│   │   ├── ItemSolicitacao.tsx
│   │   ├── ListaSolicitacoes.tsx
│   │   └── ListaSolicitacoes.module.css
│   └── ui/                                 # Componentes reutilizáveis (com seus .module.css)
│       ├── Abas.tsx
│       ├── AreaTexto.tsx
│       ├── Aviso.tsx
│       ├── BarraPesquisa.tsx
│       ├── Botao.tsx
│       ├── BotaoIcone.tsx
│       ├── Campo.module.css                # Estilos dos campos de formulário
│       ├── CampoTexto.tsx
│       ├── Cartao.tsx
│       ├── Chip.tsx
│       ├── DescricaoCampo.tsx
│       ├── Dica.tsx
│       ├── ErroCarregamento.tsx
│       ├── Esqueleto.tsx
│       ├── EstadoVazio.tsx
│       ├── Etiqueta.tsx
│       ├── Icones.tsx
│       ├── LinkBotao.tsx
│       ├── Modal.tsx
│       ├── ModalConfirmacao.tsx
│       ├── ProvedorAvisos.tsx
│       └── Seletor.tsx
├── lib/                                    # Regras de negócio e utilitários
│   ├── dadosAcademicos.ts
│   ├── edicaoGrade.ts
│   ├── escalonador.ts
│   ├── formatacao.ts
│   ├── formulario.ts
│   ├── gestaoFormulario.ts
│   ├── gestaoHorario.ts
│   ├── horario.ts
│   ├── navegacao.ts                        # Itens do menu e links do formulário
│   ├── professores.ts
│   ├── solicitacao.ts
│   └── validacao.ts
├── mocks/                                  # Dados fictícios por domínio
│   ├── academico.ts
│   ├── formularios.ts
│   ├── grades.ts
│   ├── solicitacoes.ts
│   └── usuarios.ts
├── services/                               # Funções async que leem os mocks
│   ├── academico.ts
│   ├── autenticacao.ts
│   ├── formularios.ts
│   ├── horarios.ts
│   ├── professores.ts
│   ├── simulacao.ts                        # Simula a latência de uma API
│   ├── solicitacoes.ts
│   └── usuarios.ts
├── styles/
│   └── globals.css                         # Estilos globais e variáveis CSS
└── types/                                  # Tipos do domínio
    ├── index.ts
    ├── academico.ts
    ├── formulario.ts
    ├── horario.ts
    ├── solicitacao.ts
    └── usuario.ts
```

## Variáveis de ambiente

| Variável              | Descrição         | Padrão                  |
|-----------------------|-------------------|-------------------------|
| NEXT_PUBLIC_API_URL   | URL da API back   | http://localhost:3333   |

---

## 🔧 Solução de problemas no Git

### Erro ao fazer `git push` (rejected)

Acontece quando o repositório no GitHub já tem arquivos (ex: README criado pelo GitHub).

```bash
git pull origin main --allow-unrelated-histories
# Vai abrir o editor Vim — digite :wq e pressione Enter para sair ou ctrl + c
git push -u origin nome_da_branch
```

### Subir alterações do zero novamente

```bash
git add .
git commit -m "sua mensagem aqui"
git push
```

### Se o push rejeitar de novo

```bash
git pull origin main --allow-unrelated-histories
git add .
git commit -m "sua mensagem aqui"
git push
```
