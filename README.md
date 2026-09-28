# ConsAttentia

Projeto de Trabalho de Conclusao de Curso desenvolvido pela turma 3DSB para apoiar atividades de atencao, foco e organizacao de historias.

## Integrantes

- Saymon Palermo Martins
- Lucas Ricardo Nascimento
- Giovanni Leon de Melo
- Turma: 3DSB

## Sobre o projeto

O ConsAttentia e uma aplicacao web com atividades interativas de avaliacao e exercicio da atencao.

- **TOHE:** organiza imagens em sequencias coerentes nos niveis facil e medio.
- **AATS:** reproduz listas de palavras em audio e registra respostas para criterios de atencao sustentada.

A aplicacao apresenta resultados, tentativas e tempo total, alem de gerar relatorios em PDF.

## Tecnologias e funcionalidades

- React 19, TypeScript, Vite, React Router e CSS Modules.
- Firebase Authentication e Analytics.
- Login, cadastro, logout e gerenciamento de perfil.
- Drag and drop, controle por teclado, cronometro, pontuacao e resultados.
- jsPDF e Web Share API para relatorios, com fallback para download.
- Recursos de acessibilidade e suporte a Libras.

## Como executar

```bash
npm install
npm run dev
```

Validacao do projeto:

```bash
npm run lint
npm run build
```

Configure as variaveis `VITE_FIREBASE_*` em um arquivo `.env` na raiz. Esse arquivo nao deve ser versionado.

Repositorio: [ConsAttentiaTCC no GitHub](https://github.com/ConsAttentia/ConsAttentiaTCC)