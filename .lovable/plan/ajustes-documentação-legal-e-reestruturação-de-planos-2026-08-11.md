# Ajustes, documentação legal e reestruturação de planos

## 1. QR Code do ativo (imagem 1)

RETIRA O QR CODE. NÃO QUERO ESSA FUNCIONALIDADE POR AGORA.

## 2. Responsável técnico em Documentos (imagem 2)

Trocar o campo de texto livre por um seletor dos usuários do sistema (tabela de perfis da empresa), gravando o id do usuário. Documentos antigos com texto livre continuam sendo exibidos como estão; o seletor passa a ser a única forma de preencher novos.

## 3. E-mail na sidebar (imagem 3)

Remover o e-mail do bloco de usuário na sidebar (expandida e recolhida), mantendo nome e cargo/função. O e-mail continua visível apenas na página de Perfil.

## 4. Onboarding dos módulos

Os 10 onboardings hoje têm 2–3 passos genéricos. Reescrever todos com:

- 4 a 6 passos por módulo, na ordem real de configuração (cadastros base → cadastro principal → registro/execução → acompanhamento).
- Descrição explicativa por passo (o que é, por que importa, o que a norma exige quando aplicável).
- Um texto de contexto no topo explicando o objetivo do módulo.
- Bloco "próximo passo recomendado" quando o onboarding termina.

## 5. Termos, LGPD e documentação legal

Criar páginas públicas próprias do software (rotas app-owned), com links no rodapé e no cadastro:

- `/termos` — Termos de Uso (assinatura, planos, cancelamento, limites de uso, propriedade dos dados do cliente).
- `/privacidade` — Política de Privacidade LGPD (dados coletados, finalidade, base legal, retenção, direitos do titular, canal do encarregado).
- `/seguranca-da-informacao` — práticas de segurança (isolamento por empresa, buckets privados, URLs assinadas, papéis de acesso).
- `/subprocessadores` — lista de terceiros (infraestrutura, pagamentos, e-mail).
- Aceite de Termos e Privacidade no cadastro (checkbox obrigatório, com data do aceite registrada).

Adequações que dependem de você: preciso que confirme razão social, CNPJ, endereço, e-mail do encarregado (DPO), prazo de retenção de dados após cancelamento e política de reembolso. Sem esses dados eu deixo marcadores explícitos em vez de inventar (ISSO AINDA NÃO CONSIGO INFORMAR, MAS SERIA LEGAL VOCê JÁ COLOCAR APENAS ESPERANDO O QUE VOU LHE ENVIAR ALGUNS DIAS. - (Também recomendo, tecnicamente: exportação dos dados da empresa (portabilidade) e exclusão de conta a pedido. )- QUERO QUE FAÇA ISSO AGORA.

## 6. Reestruturação de módulos e planos — relatório (sem executar)

### Situação atual

- Trial: 12 módulos, 2 usuários.
- Starter R$ 97/mês: apenas Serviços Periódicos, Treinamentos, IC & NC, ASO — 5 usuários.
- Professional R$ 247/mês: 12 módulos, 10 usuários.
- Enterprise R$ 497/mês: **exatamente os mesmos 12 módulos** do Professional; diferença é só usuários (999) e storage (100 GB).

### Problemas identificados

1. Professional e Enterprise têm o mesmo conjunto de módulos — o Enterprise não tem entrega funcional própria, só limites. Isso derruba a percepção de valor.
2. Recursos avançados já construídos não estão diferenciados no catálogo nem nas páginas públicas: investigação estruturada (5 Porquês, Ishikawa, Bow-Tie, 5W2H), assinatura digital de EPI e ficha NR-6, inspeções de campo com QR e geolocalização, condicionantes de licença com evidências, ciclo de revisão de documentos, calendário unificado e integração de agentes (MCP).
3. O módulo **Calendário** é novo e não aparece na landing page, em /funcionalidades, no llms.txt nem no sitemap.
4. Redundâncias reais e o que fazer:
  - **Calendário x Dashboard**: sobreposição de alertas. Não remover — manter Calendário como visão temporal e Dashboard como visão de risco, e retirar do Dashboard as listas duplicadas de prazos.
  - **Serviços Periódicos x Inspeções**: fronteira confusa (ambos recorrentes com evidência). Manter separados, mas explicar na UI e no site: Serviços = contratado/laudo de terceiro; Inspeções = checklist executado internamente.
  - **Documentos x Anexos por módulo**: manter, o vínculo já existe.
  - **IC & NC + Lições Aprendidas**: já unificados, ok.
  - Nenhum módulo deve ser eliminado; o ganho está em reposicionar, não em cortar.

### Proposta de reestruturação por plano

- **Starter** — base de conformidade: Serviços Periódicos, Treinamentos (matriz por cargo), ASO, IC & NC básico (registro, sem investigação estruturada), Documentos. 5 usuários.
- **Professional** — operação completa: tudo do Starter + EPI (com assinatura digital), Inspeções de campo com QR, MTR, Licenças Ambientais, Calendário, Investigação 5 Porquês, permissões por módulo. 15 usuários.
- **Enterprise** — governança e auditoria: tudo do Professional + Ishikawa e Bow-Tie, Condicionantes de licença com evidências, Fornecedores com portal externo, ciclo de revisão/aprovação de documentos, integração de agentes (MCP)/API, usuários ilimitados, storage ampliado.

### Proposta de valores (piso de mercado −25%)

Referência de mercado no segmento SST/HSE nacional: entrada ~R$ 150–200/mês, intermediário ~R$ 400–600/mês, enterprise ~R$ 900–1.500/mês.


| Plano        | Hoje   | Proposto (mensal) | Anual (10x) |
| ------------ | ------ | ----------------- | ----------- |
| Starter      | R$ 97  | R$ 129            | R$ 1.290    |
| Professional | R$ 247 | R$ 349            | R$ 3.490    |
| Enterprise   | R$ 497 | R$ 749            | R$ 7.490    |


Observação importante: seus preços atuais estão **abaixo** do teto de "25% abaixo de mercado" — ajustar para o piso proposto é aumento, não redução. Se a intenção era não subir preço, me diga e mantenho os valores atuais só reorganizando os módulos.

### Páginas a atualizar quando aprovado

Landing page, /funcionalidades (+ nova página de módulo do Calendário), /planos, FAQ, llms.txt e sitemap, refletindo módulos novos e a nova divisão de planos.

## Notas técnicas

- Itens 1 a 5 são frontend + duas migrações pequenas (coluna de responsável técnico referenciando perfis; registro de aceite de termos).
- O item 6 exige migração em `plan_definitions` e **novos preços no catálogo Stripe** — os preços antigos precisam ser substituídos e assinaturas ativas mantidas no preço legado.
- Nada do item 6 será executado sem sua aprovação explícita.

## Perguntas antes de executar

1. Manter os preços atuais ou aplicar os propostos? APLCAR TUDO QUE VOCÊ FALOU . 
2. Confirma os dados jurídicos (razão social, CNPJ, endereço, e-mail do DPO, retenção, reembolso)? Razão Social, CNPJ, ENDEREÇO, EMAIL DO DPO - NÃO FALO AGORA, MAS PREPARE O TERRENO PARA APENAS SUBSTITUIR AS INFORMAÇÕES. REEMBOLSO, É UMA ASSINATURA, NÃO TEM REEMBOLSO PARA PLANO ANUAL, PODE SER CANCELADO A QUALQUER MOMENTO, RETENÇAO, PESQUISE E INDIQUE O MEHOR TEMPO DE RETENÇÃO E APLIQUE.
  &nbsp;