import { login, logout } from '../api/auth.js';
import { salvarPessoa, salvarConfiguracao, salvarMarmita, registrarInventarioCompleto, salvarDistribuicao, removerDistribuicaoItem } from '../api/repository.js';
import { importarConsumo, importarItens } from '../core/importers.js';
import { calcularProximaCompraAutomatica } from '../core/calculators.js';
import { carregarDadosGlobais } from '../app.js'; 

export function setupAuthEvents() {
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');

    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            btnLogin.innerText = "Entrando..."; 
            try { await login(email, password); window.location.reload(); } 
            catch (error) { alert('Erro no login.'); btnLogin.innerText = "Entrar"; }
        });
    }
    if (btnLogout) btnLogout.addEventListener('click', async () => { await logout(); window.location.reload(); });

    setupNavigation();
    setupForms();
    setupImports();
}

window.salvarTodoEstoqueUI = async function() {
    const inputs = document.querySelectorAll('.estoque-batch-input');
    const dataInv = document.getElementById('input-novo-inventario-data').value;
    
    let arrayEstoque = [];
    inputs.forEach(inp => {
        arrayEstoque.push({ pessoa_id: inp.getAttribute('data-pessoaid'), quantidade: parseInt(inp.value)||0 });
    });
    
    try { 
        document.getElementById('btn-salvar-estoque').innerText = 'Salvando...';
        await registrarInventarioCompleto(arrayEstoque, dataInv); 
        await carregarDadosGlobais(); // Renderiza sem piscar a tela branca
        document.getElementById('btn-salvar-estoque').innerText = 'Inventário Salvo!';
        setTimeout(() => document.getElementById('btn-salvar-estoque').innerHTML = '<i class="ph-fill ph-check-circle"></i> Salvar Inventário', 2000);
    } catch (e) { alert('Erro ao atualizar estoque'); }
};

window.removerPedido = async function(id) {
    if(confirm('Remover este item?')) {
        try { await removerDistribuicaoItem(id); await carregarDadosGlobais(); } 
        catch (e) { alert('Erro.'); }
    }
};

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
            document.querySelectorAll('.nav-btn').forEach(nav => nav.classList.remove('text-indigo-400', 'text-slate-400'));
            document.querySelectorAll('.nav-btn').forEach(nav => nav.classList.add('text-slate-400'));
            e.currentTarget.classList.remove('text-slate-400');
            e.currentTarget.classList.add('text-indigo-400');
        });
    });
}

function setupForms() {
    // Gatilho do select de Grupo
    const selGrupo = document.getElementById('select-pedido-grupo');
    if (selGrupo) {
        selGrupo.addEventListener('change', (e) => window.atualizarDropdownMarmitas(e.target.value));
    }

    // Filtro Mês Pedidos e Catálogo
    const inputMes = document.getElementById('filtro-mes-pedido');
    if (inputMes) inputMes.addEventListener('change', carregarDadosGlobais);
    const catFiltro = document.getElementById('filtro-catalogo-grupo');
    if (catFiltro) catFiltro.addEventListener('change', () => {
        // Redesenha chamando renderCatalogo pelo window (precisa expor no escopo ou recarregar)
        carregarDadosGlobais();
    });

    const inputDataCompra = document.getElementById('input-dash-compra');
    if (inputDataCompra) {
        inputDataCompra.addEventListener('change', async (e) => {
            const novaData = e.target.value;
            const proxCalculada = calcularProximaCompraAutomatica(novaData);
            document.getElementById('input-dash-prox').value = proxCalculada;
            const dInv = document.getElementById('input-dash-inv').value;
            await salvarConfiguracao(dInv, novaData, proxCalculada);
            await carregarDadosGlobais();
        });
    }

    const formPessoa = document.getElementById('form-pessoa');
    if (formPessoa) formPessoa.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('input-nome').value;
        const consumo = {
            seg: parseInt(document.getElementById('cons-seg').value)||0, ter: parseInt(document.getElementById('cons-ter').value)||0,
            qua: parseInt(document.getElementById('cons-qua').value)||0, qui: parseInt(document.getElementById('cons-qui').value)||0,
            sex: parseInt(document.getElementById('cons-sex').value)||0, sab: parseInt(document.getElementById('cons-sab').value)||0,
            dom: parseInt(document.getElementById('cons-dom').value)||0
        };
        try { await salvarPessoa(nome, consumo); document.getElementById('input-nome').value = ''; await carregarDadosGlobais(); } catch (err) {}
    });

    const formItem = document.getElementById('form-item');
    if (formItem) formItem.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('input-item-nome').value;
        const grupo = document.getElementById('input-item-grupo').value;
        const preco = parseFloat(document.getElementById('input-item-preco').value.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
        try { await salvarMarmita(nome, grupo, preco); document.getElementById('input-item-nome').value = ''; await carregarDadosGlobais(); } catch (err) {}
    });

    const formPedido = document.getElementById('form-pedido');
    if (formPedido) formPedido.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pId = document.getElementById('select-pedido-pessoa').value;
        const mId = document.getElementById('select-pedido-marmita').value;
        const qtd = parseInt(document.getElementById('input-pedido-qtd').value) || 0;
        const mesRef = document.getElementById('filtro-mes-pedido').value; // Salva atrelado ao mês escolhido
        
        if(!pId || !mId || qtd <= 0) return;
        try { 
            await salvarDistribuicao(pId, mId, qtd, mesRef); 
            document.getElementById('input-pedido-qtd').value = '';
            await carregarDadosGlobais(); 
        } catch (err) { alert("Erro ao incluir pedido."); }
    });
}

function setupImports() {
    const fileConsumo = document.getElementById('file-consumo');
    if (fileConsumo) fileConsumo.addEventListener('change', (e) => {
        if (!e.target.files[0]) return;
        importarConsumo(e.target.files[0], async () => { await carregarDadosGlobais(); }, () => { alert("Erro."); });
    });
    const fileItens = document.getElementById('file-itens');
    if (fileItens) fileItens.addEventListener('change', (e) => {
        if (!e.target.files[0]) return;
        importarItens(e.target.files[0], async () => { await carregarDadosGlobais(); }, () => { alert("Erro."); });
    });
}