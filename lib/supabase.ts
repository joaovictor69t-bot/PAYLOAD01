import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------------------------------------------
// Para que o app funcione, você precisa criar um projeto no Supabase (https://supabase.com)
// e colar a URL e a CHAVE ANÔNIMA abaixo.
//
// Se estiver usando um ambiente local com .env, use as variáveis:
// REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY
// ------------------------------------------------------------------

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://seu-projeto-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sua-chave-anonima-publica';

// Cria o cliente Supabase.
// A URL deve ser válida (começar com https://) para evitar erro na inicialização.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
