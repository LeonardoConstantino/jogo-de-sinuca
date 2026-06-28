# 🎱 Sinuca Master Class — MVP de Física de Alta Precisão | [🚀 Live Demo](https://leonardoconstantino.github.io/jogo-de-sinuca/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)](https://www.apache.org/licenses/LICENSE-2.0)

Um simulador de sinuca solo premium desenvolvido em **TypeScript puro, React 19 e HTML5 Canvas**. Este jogo entrega uma experiência de física realista ultra-responsiva diretamente no seu navegador, sem a necessidade de bibliotecas pesadas de física de terceiros. Todo o motor vetorial e as equações de colisão elástica foram criadas sob medida.

---

## 🎨 Demonstração Visual & Estética

O jogo adota a estética **Cosmic Slate**: um canvas escuro e confortável para os olhos, iluminado por um refletor de luz suave que incide sobre o feltro verde-floresta da mesa, realçado por caçapas sombreadas com bordas metalizadas e tacos de madeira nobre polida.

```
       _____________________________________________________
     /   [O]                 [O]                 [O]   \
    |    |                                        |     |
    |    |      (O) Headstring Zone               |     |
    |    |     /                                  |     |
    | [O]|    |   (Cue Ball)      /\ (Apex)       |[O]  |
    |    |     \                 /  \             |     |
    |    |      (O)              \  /             |     |
    |    |                        \/ (Triangle)   |     |
    |    |________________________________________|     |
     \ _ [O]                 [O]                 [O] _ /
```

---

## ⚙️ Principais Funcionalidades (Escopo MVP)

1. **Física Vetorial Realista:**
   - **Colisões Elásticas Perfeitas:** Transferência de momento linear baseada em massa idêntica e coeficiente de restituição ($e = 0.96$).
   - **Atrito Amortecido:** Desaceleração de rolagem linear suave e realista que simula a resistência do tecido de feltro verde ($f = 0.988$).
   - **Rebotes nas Tabelas:** Detecção de contato e inversão de vetor com amortecimento elastômero ($e = 0.78$).

2. **Guia de Mira Dinâmico (Raycasting):**
   - Linha pontilhada inteligente que calcula o trajeto da bola branca.
   - Projeta uma **bola fantasma** semi-transparente no ponto exato de contato futuro.
   - Linhas de deflexão preditivas para calcular para onde a bola visada (amarela) e a bola branca irão após o choque (física de 90 graus/tangente).

3. **Controle de Força Tátil:**
   - O taco recua visualmente na direção oposta à mira conforme você o tensiona puxando o mouse.
   - Indicador dinâmico de tração e potência na barra lateral.

4. **Regras e Condições de Jogo:**
   - Sistema clássico de sinuca solo: encaçape as 15 bolas vermelhas/listradas antes de derrubar a **bola 8 preta**.
   - Derrubar a bola 8 prematuramente resulta em derrota instantânea.
   - Encaçapar a bola 8 por último resulta em vitória.
   - **Regra de Scratch (Falta):** Se a bola branca cair na caçapa, ela ressurge automaticamente na cabeceira da mesa (Headstring), evitando sobreposição com as demais bolas.

5. **Sintetizador de Áudio Procedural:**
   - Sons realistas de madeira ("clack") e batidas abafadas nas tabelas gerados matematicamente em tempo real via **Web Audio API** (sem arquivos pesados `.mp3` de mídia externa).

---

## 🏗️ Arquitetura de Código de Alta Coesão

A arquitetura do projeto segue princípios rígidos de separação de responsabilidades (SOLID):

```
src/
├── types/                 # Interfaces TypeScript e Enums estruturados
│   ├── entities.types.ts  # Estrutura de dados das Entidades (Bolas, Mesa, Caçapas)
│   ├── game.types.ts      # Definições de Estado de Gameplay e Estatísticas
│   └── physics.types.ts   # Modelos de corpos rígidos e vetores
│
├── config/
│   └── constants.ts       # Cores hexadecimais, tamanhos e variáveis de força física
│
├── utils/
│   ├── math.utils.ts      # Funções utilitárias (lerp, clamp, conversões trigonométricas)
│   └── vector.utils.ts    # Motor Vetorial robusto 2D (Soma, Subtração, Magnitude, Distância)
│
├── core/
│   ├── Game.ts            # Loops principais de animação e orquestrador
│   ├── PhysicsEngine.ts   # Motor matemático customizado para cálculo de colisões elásticas
│   └── Renderer.ts        # Renderização rasterizada 2D de altíssima qualidade no Canvas
│
├── entities/
│   ├── Ball.ts            # Classe de representação, estado de encaçapamento e animação de escala
│   ├── CueStick.ts        # Cálculo geométrico de ângulo e potência do taco de madeira
│   ├── Table.ts           # Inicialização da estrutura da mesa de feltro
│   └── Pocket.ts          # Sensores de detecção de proximidade com as caçapas
│
├── managers/
│   ├── InputController.ts # Conversor de coordenadas e manipulador de Mouse/Gestos Touch
│   ├── GameStateManager.ts# Máquina de estados finita do jogo (AIMING, CHARGING, MOVING, OVER)
│   └── CollisionManager.ts# Sintetizador de áudio procedural para impactos físicos
│
└── App.tsx                # Interface de Dashboard rica integrada com o Canvas
```

---

## 🕹️ Como Jogar

O jogo é extremamente intuitivo e polido para PC e dispositivos móveis (Touch):

| Ação | Controle no PC | Controle Mobile (Touch) |
|---|---|---|
| **Mirar** | Mova o cursor do mouse sobre a mesa. O taco gira acompanhando. | Deslize o dedo sobre a tela para rotacionar. |
| **Ajustar Força** | Clique e segure o botão esquerdo do mouse e **arraste para trás** (puxando o taco). | Pressione e arraste para trás para tensionar. |
| **Disparar** | Solte o botão esquerdo do mouse para efetuar a tacada. | Solte o dedo da tela para bater na bola. |

---

## 🔬 Detalhes da Física de Colisão

O coração do jogo é o método `resolveBallCollisions` na classe `PhysicsEngine.ts`. Quando duas esferas com posições $P_A, P_B$ e velocidades $V_A, V_B$ se sobrepõem:

1. **Separação de Sobreposição:**
   Para evitar que as bolas fiquem presas ou entrem uma dentro da outra, calculamos o vetor de sobreposição e as afastamos proporcionalmente às suas massas:
   $$\text{Afastamento} = \text{Normal} \times (\text{Distância Mínima} - \text{Distância Atual}) \times 0.51$$

2. **Cálculo do Impulso de Colisão:**
   Calculamos a velocidade relativa projetada no vetor normal de contato. Se elas estão se movendo uma em direção à outra, aplicamos o vetor de impulso elástico baseado no coeficiente de bounciness ($e$):
   $$\text{Impulso} = \frac{-(1 + e) \cdot (V_{\text{relativa}} \cdot \text{Normal})}{\frac{1}{M_A} + \frac{1}{M_B}}$$
   As novas velocidades são atualizadas instantaneamente preservando a conservação do momento linear do sistema.

---

## 🛠️ Instalação e Execução Local

Siga as instruções abaixo para executar o projeto localmente:

1. **Instalar dependências do Node:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento local (Vite):**
   ```bash
   npm run dev
   ```
   Abra o endereço exibido no terminal (ex: `http://localhost:3000`) em seu navegador.

3. **Gerar build de produção otimizado:**
   ```bash
   npm run build
   ```

4. **Verificar erros de tipagem com linter:**
   ```bash
   npm run lint
   ```

---

## ✨ Créditos e Tecnologias

- **Linguagem:** TypeScript 5.8
- **Framework:** React 19 (Hooks, Contextos, refs de Canvas)
- **Estilização:** Tailwind CSS v4.0
- **Animações:** Motion (antigo Framer Motion)
- **Ícones:** Lucide React
- **Áudio:** Web Audio API Procedural Synth
