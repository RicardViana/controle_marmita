import { supabaseClient } from '../config/supabase.js';

export async function getPessoas() {
    const { data, error } = await supabaseClient.from('pessoas').select('*');
    if (error) throw error; return data || [];
}
export async function getMarmitas() {
    const { data, error } = await supabaseClient.from('marmitas').select('*');
    if (error) throw error; return data || [];
}
export async function getConfiguracoes() {
    const { data, error } = await supabaseClient.from('configuracoes').select('*').maybeSingle();
    if (error && error.code !== 'PGRST116') throw error; return data || {};
}
export async function getEstoque() {
    const { data, error } = await supabaseClient.from('estoque').select('pessoa_id, quantidade');
    if (error) throw error; return data || [];
}
export async function getDistribuicao() {
    const { data, error } = await supabaseClient.from('distribuicao').select(`
        id, quantidade, mes_referencia,
        pessoas ( id, nome ),
        marmitas ( id, nome, grupo, preco )
    `);
    if (error) throw error; return data || [];
}

export async function salvarPessoa(nome, consumo) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const record = { user_id: user.id, nome: nome, seg: consumo.seg, ter: consumo.ter, qua: consumo.qua, qui: consumo.qui, sex: consumo.sex, sab: consumo.sab, dom: consumo.dom };
    const { error } = await supabaseClient.from('pessoas').upsert(record, { onConflict: 'user_id, nome' });
    if (error) throw error;
}
export async function salvarMarmita(nome, grupo, preco) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { error } = await supabaseClient.from('marmitas').upsert({ user_id: user.id, nome, grupo, preco }, { onConflict: 'user_id, nome' });
    if (error) throw error;
}

export async function registrarInventarioCompleto(estoqueArray, dataInv) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient.from('configuracoes').upsert({ user_id: user.id, data_inventario: dataInv }, { onConflict: 'user_id' });
    for(let est of estoqueArray) {
        await supabaseClient.from('estoque').delete().eq('pessoa_id', est.pessoa_id).is('marmita_id', null);
        await supabaseClient.from('estoque').insert([{ user_id: user.id, pessoa_id: est.pessoa_id, quantidade: est.quantidade }]);
    }
}

export async function salvarDistribuicao(pessoaId, marmitaId, quantidade, mesRef) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { error } = await supabaseClient.from('distribuicao').insert([{ user_id: user.id, pessoa_id: pessoaId, marmita_id: marmitaId, quantidade: quantidade, mes_referencia: mesRef }]);
    if (error) throw error;
}
export async function removerDistribuicaoItem(id) {
    const { error } = await supabaseClient.from('distribuicao').delete().eq('id', id);
    if (error) throw error;
}
export async function salvarConfiguracao(dataInv, dataCompra, dataProx) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { error } = await supabaseClient.from('configuracoes').upsert({ user_id: user.id, data_inventario: dataInv, data_compra: dataCompra, data_proxima_compra: dataProx }, { onConflict: 'user_id' });
    if (error) throw error;
}
export async function salvarPessoasLote(pessoasArray) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const records = pessoasArray.map(p => ({ user_id: user.id, ...p }));
    const { error } = await supabaseClient.from('pessoas').upsert(records, { onConflict: 'user_id, nome' });
    if (error) throw error;
}
export async function salvarMarmitasLote(marmitasArray) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const records = marmitasArray.map(m => ({ user_id: user.id, ...m }));
    const { error } = await supabaseClient.from('marmitas').upsert(records, { onConflict: 'user_id, nome' });
    if (error) throw error;
}