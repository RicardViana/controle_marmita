import { supabaseClient } from '../config/supabase.js';

export async function checkSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) console.error("Erro na sessão:", error);
    return session;
}

export async function login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}