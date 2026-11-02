// Substitua pelas chaves reais do seu painel do Supabase
const SUPABASE_URL = 'https://uldxgfyqceaojzzlzkoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhnZnlxY2Vhb2p6emx6a29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDM5ODQsImV4cCI6MjEwODg3OTk4NH0.TN2IMkRW6BT32mWDucULBiP6hz2DOHn_gZXO75k7nYI';

// O "window." evita que o navegador se confunda com a variável global do CDN
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);