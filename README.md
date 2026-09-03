<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF6B35,100:FFB86C&height=140&section=header&text=Life%20RPG&fontSize=42&fontColor=0d1117&animation=fadeIn&fontAlignY=45" width="100%"/>

</div>

# Life RPG

**Transforma as tuas tarefas do dia a dia em missões de RPG.**

Life RPG é uma aplicação Web que aplica mecânicas de gamificação (níveis, XP, missões, loot, perks) a tarefas quotidianas, com geração dinâmica de missões através de um modelo de linguagem (LLM) executado localmente no browser via WebGPU.

Projeto desenvolvido no âmbito da Licenciatura em Engenharia Informática, Escola de Tecnologia da Universidade de Trás-os-Montes e Alto Douro (UTAD), ano letivo 2025/26.

---

## Autores

- **Tiago Ribeiro**
- **André Marques**

**Orientador:** Deni Junior — BLIP

---

## Sobre o Projeto

A gamificação tem-se mostrado eficaz para aumentar a motivação e o compromisso dos utilizadores em contextos fora do entretenimento (Duolingo, Nike Run Club, LinkedIn, entre outros). O Life RPG explora esta ideia aplicada ao desenvolvimento pessoal: o utilizador escolhe competências que quer desenvolver (exercício, estudo, organização, etc.) e recebe missões diárias personalizadas, geradas por IA, adaptadas ao seu nível atual. Ao completar missões, ganha XP, sobe de nível, desbloqueia perks e recebe loot para o seu inventário.

A identidade visual segue uma estética **cyberpunk**, posicionando o utilizador como um "Operador" numa rede neural digital.

### Principais funcionalidades

- Autenticação segura (JWT + bcrypt)
- Criação e gestão de competências pessoais
- Geração automática de missões personalizadas via LLM local
- Sistema de progressão por XP e níveis
- Inventário, equipamentos e consumíveis
- Sistema de perks (bónus passivos) por competência
- Persistência de dados
- Interface responsiva com temas personalizáveis e modo de alto contraste

---

## Tecnologias

### Front-end
- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com) — navegação e rotas protegidas
- Context API — gestão de estado global
- CSS puro (sem frameworks)
- [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) — inferência de LLM no browser via WebGPU

### Back-end
- [Node.js](https://nodejs.org) + [Express](https://expressjs.com)
- [LowDB](https://github.com/typicode/lowdb) — persistência baseada em JSON
- [JSON Web Tokens (JWT)](https://jwt.io) — autenticação
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — hashing de passwords

### Modelo de Linguagem
- **Llama-3.2-3B-Instruct**, executado localmente no navegador via WebGPU (sem dependência de serviços externos, preservando a privacidade dos dados do utilizador)

---

## Arquitetura

O sistema segue uma arquitetura cliente-servidor modular, dividida em:

- **Front-end** — interação com o utilizador
- **Back-end** — lógica de negócio e APIs REST
- **Base de dados** — persistência da informação
- **Integração LLM** — geração dinâmica de missões

```
Utilizador ⇄ Front-end (React) ⇄ Back-end (Express) ⇄ Base de Dados (LowDB)
                    ⇡
                 WebLLM (geração de missões)
```

### Estrutura do Front-end

```
assets/        # imagens, ícones, avatares
components/    # componentes reutilizáveis (Sidebar, popups, modais...)
context/       # UserContext — estado global do utilizador
hooks/         # useQuests, useDailyMissions, etc.
pages/         # ecrãs da aplicação (Login, Dashboard, Quests, Skills...)
App.jsx        # rotas da aplicação (React Router + PrivateRoute)
main.jsx       # ponto de entrada da aplicação
```

### Estrutura do Back-end

```
routes/        # definição dos endpoints da API
controllers/   # lógica de negócio (auth, users, skills, missions, inventory...)
db.js          # instância partilhada da base de dados (LowDB)
```

---

## Como executar o projeto

### Pré-requisitos
- [Node.js](https://nodejs.org) instalado
- Navegador com suporte a **WebGPU** (ex.: Chrome/Edge atualizados) para a geração de missões por IA

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd life-rpg

# Instalar dependências do back-end
cd backend
npm install

# Instalar dependências do front-end
cd ../frontend
npm install
```

### Execução

```bash
# Iniciar o back-end
cd backend
npm start

# Noutro terminal, iniciar o front-end
cd frontend
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173` (ou porta indicada pelo Vite), com o back-end a correr por defeito em `http://localhost:3000` (ajustar conforme configuração).

---

## Requisitos Funcionais Implementados

| ID | Descrição |
|----|-----------|
| RF01 | Registo de utilizador |
| RF02 | Autenticação (login/logout) |
| RF03 | Gestão de perfil |
| RF04 | Criação de competências |
| RF05 | Seleção de competências iniciais |
| RF06 | Geração de missões personalizadas (LLM) |
| RF07 | Visualização de missões |
| RF08 | Conclusão de missões |
| RF09 | Sistema de progressão (XP/nível) |
| RF10 | Histórico de progresso |
| RF11 | Adaptação dinâmica da dificuldade |
| RF12 | Feedback visual de evolução |
| RF13 | Integração com LLM |
| RF14 | Persistência de dados |
| RF15 | Testes end-to-end dos fluxos principais |

## Trabalho Futuro

- Sistema multiplayer (cooperação, desafios e missões partilhadas)
- Leaderboards globais e rankings de progressão
- Achievements e conquistas desbloqueáveis
- Eventos temporários e desafios sazonais
- Mascote virtual inteligente (tutorial, sugestões, motivação)
- Versão mobile, notificações, sincronização cloud, mais idiomas

---

## Referências

- React — https://react.dev
- Vite — https://vitejs.dev
- Express.js — https://expressjs.com
- LowDB — https://github.com/typicode/lowdb
- JSON Web Tokens — https://jwt.io
- bcrypt — https://github.com/kelektiv/node.bcrypt.js
- @mlc-ai/web-llm — https://github.com/mlc-ai/web-llm
- Meta AI, *Llama 3.2* (2024)
- W3C, *WebGPU Specification*
- Deterding, S. et al. (2011). *From game design elements to gamefulness: Defining gamification*
- Hamari, J. et al. (2014). *Does gamification work? A literature review of empirical studies on gamification*
- Vaswani, A. et al. (2017). *Attention is all you need*

---

## Licença

Projeto académico desenvolvido para a UC de Projeto, Engenharia Informática — UTAD, 2025/26.
