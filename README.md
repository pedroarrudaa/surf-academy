# SurfAcademy

A modern platform for WindSurf IDE tutorials and blogs, featuring resources to help developers get the most out of this powerful code editor.

## Features

- Browse WindSurf IDE tutorial videos
- Read blog posts about WindSurf IDE and Codium AI integration
- Responsive design that works on mobile and desktop
- Comprehensive information about IDE features and extensions

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pedroarrudaa/surf-academy.git
cd surf_academy
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## About WindSurf IDE

WindSurf IDE is a modern code editor designed for developers who want to streamline their workflow and boost productivity. Key features include:

- Powerful integrated debugger
- Git integration for version control
- Extension marketplace
- Remote development capabilities
- Advanced customization options
- Codium AI integration for intelligent coding assistance

## Technologies Used

- Next.js and React
- TypeScript
- Tailwind CSS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Melhorias na Transcrição e Análise de Vídeos

### Visão Geral

Implementamos um sistema robusto de processamento de vídeos usando a API Whisper da OpenAI para transcrever e analisar conteúdo de vídeos do YouTube. Este sistema permite a extração automática de capítulos, resumos e conteúdo detalhado dos vídeos.

### Principais Recursos

#### 1. Processamento Confiável de Áudio
- Extração otimizada de áudio de vídeos do YouTube
- Cache de arquivos para evitar downloads repetidos
- Seleção inteligente do formato de áudio para melhor qualidade
- Tratamento robusto de erros durante o download

#### 2. Transcrição com Whisper AI
- Utilização do modelo `whisper-1` para transcrição precisa
- Temperatura baixa (0.2) para garantir resultados mais consistentes
- Detecção automática de idioma com preferência para inglês
- Logging detalhado para diagnóstico

#### 3. Geração Inteligente de Capítulos
- Extração de capítulos baseada em análise de parágrafos e marcações de tempo
- Fallback para segmentação baseada em sentenças quando necessário
- Validação de timestamps para garantir compatibilidade com a duração do vídeo
- Ordenação e filtragem de capítulos inválidos

#### 4. Componente de Modal de Vídeo Aprimorado
- Detecção automática de duração do vídeo via API do YouTube
- Validação de capítulos contra a duração real
- Estados de interface reativos para feedback em tempo real
- Suporte para transcrição sob demanda

#### 5. Tratamento Robusto de Erros
- Detecção e recuperação de falhas em cada fase do processo
- Feedback visual para o usuário sobre o status do processamento
- Opções de retry em caso de falhas
- Logging detalhado para diagnóstico

### Fluxo de Processamento

1. **Extração de Áudio**: O sistema baixa o áudio do vídeo do YouTube com a melhor qualidade disponível.
2. **Transcrição**: O áudio é enviado para a API Whisper para transcrição completa.
3. **Geração de Capítulos**: A transcrição é analisada para identificar divisões naturais e criar capítulos.
4. **Validação**: Os timestamps são validados contra a duração real do vídeo.
5. **Apresentação**: Os capítulos validados são exibidos na interface, permitindo navegação direta.

### Benefícios

- **Para Usuários**: Navegação fácil pelo conteúdo do vídeo, resumos rápidos e melhor compreensão.
- **Para Administradores**: Processamento automatizado de vídeos com mínima intervenção manual.
- **Para Desenvolvedores**: Código modular e bem documentado, fácil de manter e estender.

### Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Processamento de Áudio**: ytdl-core
- **AI**: OpenAI Whisper API
- **Integração de Vídeo**: YouTube iFrame API

Esta implementação resolve problemas comuns como timestamps incorretos, capítulos mal segmentados e falhas no processamento de áudio, garantindo uma experiência confiável e de alta qualidade para os usuários.
