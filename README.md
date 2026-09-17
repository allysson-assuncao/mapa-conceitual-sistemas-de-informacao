# 🗺️ Mapa Conceitual de Sistemas de Informação

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.0.2-4554ff?style=for-the-badge)](https://reactflow.dev)
[![Vercel](https://img.shields.io/badge/Hosted%20by-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

Um mapa conceitual interativo e visualmente rico que conecta disciplinas, competências e áreas de atuação do profissional de Sistemas de Informação. O projeto utiliza **Next.js** para renderização estática, **React Flow** para o grafo interativo e **Zustand** para gerenciamento de estado global.

---

## 📋 Índice

- [🚀 Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🗂️ Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Configuração e Execução](#️-configuração-e-execução)
- [📦 Deploy](#️-deploy)
- [🎨 Design e UX](#-design-e-ux)
- [🧪 Testes](#️-testes)
- [📜 Licença](#️-licença)
- [👨‍💻 Autor](#-autor)

---

## 🚀 Funcionalidades

### Interatividade do Mapa

- **Arrastar e Soltar**: Mova disciplinas e áreas de atuação livremente pelo canvas
- **Zoom e Pan**: Navegação fluida pelo mapa com mouse wheel e drag
- **Seleção e Destaque**: Clique para selecionar, duplo clique para fixar e clique triplo para remover
- **Conexões Dinâmicas**: Visualize conexões entre disciplinas e áreas de atuação
- **Filtros Inteligentes**: Filtre disciplinas por semestre, área de atuação e tipo (obrigatória/optativa)

### Painéis e Detalhes

- **Painel de Detalhes (Esquerda)**: Exibe informações detalhadas sobre cada disciplina/área
- **Painel de Seleção (Direita)**: Gerencie disciplinas selecionadas e visualize estatísticas do plano de estudo
- **Detalhamento de Competências**: Visualize competências relacionadas a cada disciplina
- **Visualização de Conexões**: Veja as competências que uma disciplina habilita

### Temas e Cores

- **Mapa de Cores**: Cores vibrantes baseadas nas áreas de atuação
- **Tema Escuro Automático**: Switch automático baseado no sistema operacional
- **Acessibilidade**: Alto contraste e modos de cores ajustáveis

### Performance

- **Renderização Estática**: Next.js SSG gera página pré-renderizada para máxima performance
- **Memoização**: Componentes com React.memo para evitar re-renderizações desnecessárias
- **Scroll Optimization**: Scroll suave para novos nós selecionados
- **Lazy Loading**: Assets carregados sob demanda

### Layout e Organização

- **Algoritmo de Layout**: Computação automática de posições para todos os nós
- **Estrutura Hierárquica**: Organização visual lógica por semestre e áreas de atuação
- **Espaçamento Automático**: Distância otimizada entre nós para evitar sobreposições

---

## 🛠️ Tecnologias

### Framework Principal

- **Next.js 14** - Framework React com Server-Side Rendering (SSR) e Static Site Generation (SSG)
  - **App Router**: Sistema de rotas baseado em diretórios
  - **Static Export**: Geração de arquivos HTML estáticos para deploy no GitHub Pages

### Gerenciamento de Estado

- **Zustand** - Biblioteca leve e rápida para gerenciamento de estado global
  - **Store único**: `map-store.ts` centraliza estado do mapa, seleção e filtros

### Visualização de Grafos

- **React Flow** - Biblioteca completa para criação de diagramas e grafos
  - **Nós customizados**: Componentes separados para diferentes tipos de nós
  - **Edges customizadas**: Conexões visuais com estilos personalizados
  - **Controles**: Barra de zoom e fit-view

### Estilização

- **Tailwind CSS** - Framework utilitário para estilização rápida
  - **Design System**: Cores, tipografia e espaçamento consistentes
  - **Dark Mode**: Tema escuro com `next-themes`
  - **Customizations**: Configuração completa no `tailwind.config.ts`

### Animações

- **Framer Motion** - Biblioteca de animação declarativa
  - **Transições suaves**: Animações de entrada, saída e movimento

### Iconografia

- **Lucide-React** - Biblioteca de ícones minimalistas
  - **Conjunto completo**: Diversos ícones para disciplinas e áreas de atuação

### Outras Ferramentas

- ** ESLint** - Análise de código estática
- **Prettier** - Formatação automática de código
- ** Husky** - Hooks para Git pré-commit
- **Lint-staged** - Execução de linters em arquivos staged

---

## 🗂️ Estrutura do Projeto

```
mapa-conceitual-sistemas-de-informacao/
├── src/
│   ├── app/                      # Rotas da aplicação
│   │   ├── page.tsx              # Página principal com o mapa
│   │   └── layout.tsx            # Layout global com tema e fonte
│   ├── components/
│   │   ├── map/                  # Componentes relacionados ao mapa
│   │   │   ├── ConceptMap.tsx    # Componente principal do mapa
│   │   │   ├── nodes/            # Tipos de nós do mapa
│   │   │   │   ├── CareerAreaNode.tsx
│   │   │   │   ├── DisciplineNode.tsx
│   │   │   │   └── InfoNode.tsx
│   │   │   ├── edges/            # Tipos de arestas do mapa
│   │   │   │   ├── ConnectionEdge.tsx
│   │   │   │   └── InfoEdge.tsx
│   │   │   └── MapControls.tsx   # Controles do mapa
│   │   ├── panel/                # Componentes de painéis laterais
│   │   │   ├── DetailPanel.tsx   # Painel de detalhes
│   │   │   ├── SelectionPanel.tsx  # Painel de seleção
│   │   │   ├── DisciplineDetail.tsx
│   │   │   └── CareerAreaDetail.tsx
│   │   └── ui/                   # Componentes de UI customizados
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Sheet.tsx
│   │       ├── Tooltip.tsx
│   │       └── ...
│   ├── lib/                      # Funções utilitárias e dados
│   │   ├── types.ts              # Definições de tipos TypeScript
│   │   ├── data.ts               # Dados estáticos das disciplinas e áreas
│   │   ├── layout-engine.ts      # Algoritmo de computação de layout
│   │   └── filters.ts            # Lógica de filtragem
│   ├── store/                    # Gerenciamento de estado
│   │   └── map-store.ts          # Store global do mapa
│   ├── styles/                   # Estilos globais
│   │   └── globals.css           # Estilos do Tailwind CSS
│   └── assets/                   # Arquivos estáticos
│       └── disciplines.csv       # CSV de disciplinas
├── .env.production               # Variáveis de ambiente de produção
├── next.config.ts                # Configuração do Next.