// Configuração do Supabase. Mesmo projeto do Treino de Guitarra (mesma URL/chave) — decisão do
// usuário para não ter dois painéis Supabase pra cuidar; as tabelas deste app têm prefixo "drum_"
// (ver supabase/schema.sql e js/sync-core.js / js/teacher-core.js) pra não colidir com as de guitarra.
//
// A chave "publishable" (antiga "anon") é PÚBLICA por desenho: quem protege os dados é a política
// de acesso por linha (RLS) de supabase/schema.sql. Nunca coloque aqui a chave "secret" / "service_role".
//
// Se ficar vazio, o app funciona normalmente, só que sem sincronizar.

export const SUPABASE_URL = 'https://tajewxwwhqqgaptdvbln.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_MuRjS28GczrlOQXzObgwjQ_sHNoceC5';
