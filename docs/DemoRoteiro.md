# Roteiro de demonstração do MVP (smoke test)

Roteiro exato da jornada mínima executada na demonstração ao cliente
(17/09/2026), com o critério de degradação: **o que pode falhar sem cancelar
a demo**. Escrito cedo para disciplinar o escopo — os dry-runs #41 e #42
executam exatamente estes passos; "pronto para demonstrar" = passos 1–10
verdes no dispositivo de demo.

(transistir/coiab-app#40. Documento em português — artefato voltado à equipe
que opera a demo; desvio consciente da convenção EN dos docs do repo,
registrado como default assumido.)

## Pré-condições

- **Dispositivo de demonstração limpo:** desinstalar o app (ou limpar os
  dados do aplicativo) antes do passo 1. Instalar o APK por cima de uma
  instalação já onboarded preserva estado — o app abre direto na Home e o
  passo 1 falha (aviso equivalente em
  `docs/EndToEndTests/E2EWithAppium.md:62`).
- APK candidato (build pelo comando canônico da #13) instalado no dispositivo
  de demonstração.
- **Segundo dispositivo pronto antes do passo 10** (é bloqueador — "disponível"
  não basta): o MESMO APK candidato instalado (a tela de convite exige a
  mesma versão do app nos dois dispositivos, ver
  `src/frontend/screens/YourTeam/SelectInviteDevice.tsx`), os dois na mesma
  rede Wi-Fi, e o segundo dispositivo com o onboarding ao menos até a
  nomeação concluída — um dispositivo zerado sem nome não aparece na lista
  de convites.
- Roteiro decorado/preso: a demo não improvisa passos fora desta lista.

## A jornada — 12 passos

**Passos 1–10 são bloqueadores: falha em qualquer um cancela ou posterga a
demonstração.** Passos 11–12 são demo-desejáveis (critério de degradação já
decidido na #40): uma falha ali é registrada, comunicada como conhecida, e a
demo continua.

| # | Passo | Verificação de sucesso |
|---|-------|------------------------|
| 1 | Instalar o APK candidato no dispositivo | App abre na tela inicial do onboarding, sem crash |
| 2 | Onboarding: nomear o dispositivo | Nome aceito; fluxo avança |
| 3 | Informar etnia (opcional) | Campo aceita texto OU é pulado sem bloqueio ('não informar' = vazio, decisão #21) |
| 4 | Escolher "Criar organização" e nomeá-la | Tela de criação conclui sem erro (decisão #26: entrada por convite não é exercitada aqui — criamos a org) |
| 5 | Os dois projetos materializam automaticamente | "Monitoramento" e "Alertas" existem com as categorias do template (#30), sem ação extra (#31) |
| 6 | Bottom navigation: alternar Monitoramento ↔ Alertas | Troca sem crash, sem perda de dado persistido (#33/#34) |
| 7 | Criar observação em Monitoramento | Categoria (ex. "Fiscalização rotineira") + foto + GPS salvos e visíveis |
| 8 | Criar observação em Alertas | Categoria (ex. "Incêndio / fumaça") salva e visível |
| 9 | Isolamento entre projetos | Cada observação aparece só no seu projeto; nada vaza entre Monitoramento e Alertas |
| 10 | Convidar um segundo dispositivo; aceitar o convite | Convidado entra na organização e vê os dois projetos (#27) |
| 11 | *(desejável)* Configurar Remote Archive no nível da organização | Uma única URL aplica aos dois projetos (#36/#37) |
| 12 | *(desejável)* Sincronização com o archive + indicador de conexão/reconexão | Sem regressão da sincronização existente (#38/#39) |

## O que pode falhar sem cancelar a demo (critério de degradação)

- **Bloqueador:** qualquer falha nos passos 1–10 — crash, perda de dado,
  projeto que não materializa, alternância que quebra, convite que não chega.
- **Aceitável (demo-desejável):** estado de conexão/reconexão do Remote
  Archive com comportamento estranho (passos 11–12), desde que os passos
  1–10 funcionem; falha é dita ao cliente como conhecida e rastreada.
- **Aceitável (cosmético):** strings de idioma, espaçamento, ícone
  provisório — não interrompem; anotar para o pós-demo.

## Notas de execução

- Os passos derivam da cadeia dos épicos: onboarding (#3/#22), organização
  (#4/#26), dois projetos (#5/#30/#31), navegação (#6/#33), observações e
  isolamento, convite (#27), Remote Archive (#8/#36–#39), jornada (#10).
  **O corpo do épico citado como fonte dos "12 passos" não foi localizado na
  forma numerada** (o épico da jornada hoje é #10, sem lista numerada);
  reconstruímos os 12 passos a partir das sub-issues — se existir lista
  canônica em outro lugar, o revisor humano deve alinhar a numeração.
- A demonstração usa uma organização criada ao vivo (passo 4), não uma
  organização pré-preparada — o roteiro prova o fluxo desde o zero.
- Duração alvo: ~10 minutos para os passos 1–10; 11–12 se houver tempo e
  rede.

## Pronto para demonstrar (definição operacional)

1. Dry-run intermediário (#41): passos 1–10 verdes em emulador até ~09–10/09.
2. Jornada completa (#42): passos 1–10 verdes no dispositivo real de demo.
3. APK candidato (#43) gerado pelo comando canônico (#13).
4. Regressões bloqueadoras (#44) zeradas.
5. Pacote de evidências (#45) montado no template de handoff
   (docs/FactoryProcess.md §4). **Ordem obrigatória: o PR
   transistir/comapeo-mobile-1#76 (que introduz o FactoryProcess.md) precisa
   estar mergeado antes de montar este pacote** — sem ele o template não
   existe nesta árvore.
