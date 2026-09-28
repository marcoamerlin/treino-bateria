# Publicar e sincronizar

Duas partes independentes: **GitHub Pages** publica o app (HTTPS, necessário para instalar no
celular) e **Supabase** guarda o treino para sincronizar entre aparelhos. Este app reaproveita o
MESMO projeto Supabase do Treino de Guitarra (mesma conta, mesma URL/chave em `js/config.js`) —
só precisa rodar um schema adicional nele.

## 1. GitHub Pages

1. Em https://github.com/new: nome `treino-bateria`, **Public**, sem README/.gitignore/licença.
   (GitHub Pages gratuito exige repositório público. O repositório só tem código e conteúdo de treino.)
2. `git remote add origin https://github.com/marcoamerlin/treino-bateria.git` e `git push -u origin main`.
3. No repositório: Settings → Pages → Build and deployment → Source: **Deploy from a branch** →
   Branch: `main`, pasta `/ (root)` → Save.
4. Em ~1 minuto o app fica em https://marcoamerlin.github.io/treino-bateria/.
   Cada `git push` republica sozinho.

No celular, abrir o endereço no Chrome (Android) ou Safari (iPhone) e usar
"Instalar app" / "Adicionar à Tela de Início".

## 2. Supabase (projeto já existente, o mesmo da guitarra)

1. Abrir o projeto Supabase `treino-guitarra` já criado (https://supabase.com → seus projetos).
   Não crie um projeto novo — `js/config.js` deste app já aponta pra URL/chave dele.
2. **SQL Editor** → colar todo o conteúdo de `supabase/schema.sql` (deste projeto, `treino-bateria`)
   → Run. É aditivo e idempotente: só cria as tabelas `drum_user_data`, `drum_teacher_codes` e
   `drum_teacher_links` (prefixo "drum\_"), sem tocar nas tabelas da guitarra nem nos dados
   existentes.
3. A conta de login já existe (é a mesma da guitarra, criada em **Authentication → Users** quando
   o projeto foi montado). Não é preciso criar uma conta nova — o mesmo e-mail/senha funciona nos
   dois apps, só que cada um guarda o treino numa tabela diferente (`user_data` vs.
   `drum_user_data`), então guitarra e bateria não se misturam.
4. Se for dar aula de bateria pra outras pessoas: as contas dos alunos também já podem existir
   (se já são alunos de guitarra) ou precisam ser criadas à mão do mesmo jeito (**Authentication →
   Users → Add user**, cadastro público continua desligado).

Observação: projetos gratuitos do Supabase são pausados após 7 dias sem uso. Usando algum dos dois
apps (guitarra ou bateria) diariamente isso não acontece; se pausar, basta reativar no painel — a
pausa afeta os dois juntos, por serem o mesmo projeto.

## 3. Atualizar o schema

Sempre que `supabase/schema.sql` mudar: **SQL Editor** do projeto `treino-guitarra` → colar todo o
conteúdo do arquivo de novo → Run. É seguro rodar de novo mesmo já tendo dados: as tabelas e
políticas existentes não são apagadas, só criadas as que faltam.

Depois de rodar, qualquer usuário pode: em **Conta e sincronização**, abrir "▸ Sou professor de
alguém" para gerar um código e ver a lista de alunos vinculados; ou, para ser aluno de alguém,
digitar o código dele no campo "Vincular a um professor". O código do professor de bateria é
diferente do código de professor de guitarra (tabelas separadas) — gere um em cada app se for
professor nos dois.

## Testar localmente

- `npm start` (ou `node tools/serve.mjs`) → http://localhost:5174 no notebook (porta diferente da
  guitarra, 5173, pra dar pra rodar os dois ao mesmo tempo).
- No celular, na mesma rede: `http://<IP do notebook>:5174`. Funciona layout, toque e som, mas
  instalar, modo offline e manter a tela acesa exigem HTTPS (só no GitHub Pages).
- `npm test` roda os testes da combinação de dados, da sincronização e do banco de rudimentos.
