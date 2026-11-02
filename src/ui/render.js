import { calcularEncerramento, calcularDescontoGlobal } from '../core/calculators.js';

let cacheMarmitas = []; // Usado para o filtro em cascata

export function renderDashboard(pessoas, config, estoque, calcularNecessidade) {
    const tbody = document.getElementById('dash-table-body');
    if (!tbody) return;

    let totalEstoque = 0, totalMes = 0, totalComprar = 0;
    tbody.innerHTML = '';

    pessoas.forEach(pessoa => {
        const estoquePessoa = estoque.filter(e => e.pessoa_id === pessoa.id).reduce((acc, curr) => acc + curr.quantidade, 0);
        const calc = calcularNecessidade(pessoa, config, estoquePessoa);
        const dataEncerra = calcularEncerramento(pessoa, config?.data_inventario, estoquePessoa);

        totalEstoque += calc.estoque;
        totalMes += calc.qtdMes;
        totalComprar += calc.qtdCompra;

        tbody.innerHTML += `
            <tr class="border-b border-slate-800 text-sm hover:bg-slate-800/50 transition">
                <td class="py-3 text-white">${pessoa.nome}</td>
                <td class="py-3 text-center text-slate-300 font-bold bg-slate-800 rounded">${calc.estoque}</td>
                <td class="py-3 text-center text-slate-400">${dataEncerra}</td>
                <td class="py-3 text-center text-slate-300">${calc.qtdMes}</td>
                <td class="py-3 text-center font-bold text-indigo-400">${calc.qtdCompra}</td>
            </tr>
        `;
    });

    document.getElementById('total-estoque-resumo').innerText = totalEstoque;
    document.getElementById('total-mes-resumo').innerText = totalMes;
    document.getElementById('total-comprar-resumo').innerText = totalComprar;
}

export function renderSelectsPedido(pessoas, marmitas) {
    cacheMarmitas = marmitas;
    const selPessoa = document.getElementById('select-pedido-pessoa');
    const selGrupo = document.getElementById('select-pedido-grupo');
    
    if (selPessoa) {
        selPessoa.innerHTML = '<option value="">Selecione a Pessoa...</option>' + 
            pessoas.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    }
    
    if (selGrupo) {
        const grupos = [...new Set(marmitas.map(m => m.grupo).filter(Boolean))].sort();
        selGrupo.innerHTML = '<option value="">1. Filtre por Linha/Grupo</option>' + 
            grupos.map(g => `<option value="${g}">${g}</option>`).join('');
    }
    
    window.atualizarDropdownMarmitas('');
}

window.atualizarDropdownMarmitas = function(grupo) {
    const selMarmita = document.getElementById('select-pedido-marmita');
    if (!selMarmita) return;
    
    let filtrado = grupo ? cacheMarmitas.filter(m => m.grupo === grupo) : cacheMarmitas;
    filtrado = filtrado.sort((a,b) => a.nome.localeCompare(b.nome));
    
    selMarmita.innerHTML = '<option value="">2. Escolha o Item...</option>' + 
        filtrado.map(m => `<option value="${m.id}">${m.nome} (R$ ${m.preco.toFixed(2).replace('.',',')})</option>`).join('');
}

export function renderTabelaPedido(distribuicaoOriginal, mesFiltro) {
    const tbody = document.getElementById('tabela-pedido-body');
    if (!tbody) return;

    // Filtra pelo mês atual da visão
    const distribuicao = distribuicaoOriginal.filter(d => (d.mes_referencia || '') === mesFiltro);

    let totalGeral = 0;
    let qtdGeral = 0;

    tbody.innerHTML = distribuicao.map(d => {
        const valorTotal = d.quantidade * d.marmitas.preco;
        totalGeral += valorTotal;
        qtdGeral += d.quantidade;

        return `
            <tr class="border-b border-slate-800 text-xs hover:bg-slate-800/50 transition">
                <td class="py-2 text-white font-medium">${d.pessoas.nome}</td>
                <td class="py-2 text-slate-400 hidden md:table-cell">${d.marmitas.grupo || '-'}</td>
                <td class="py-2 text-slate-300 max-w-[150px] truncate" title="${d.marmitas.nome}">${d.marmitas.nome}</td>
                <td class="py-2 text-center text-white">${d.quantidade}</td>
                <td class="py-2 text-right text-slate-400">R$ ${d.marmitas.preco.toFixed(2).replace('.',',')}</td>
                <td class="py-2 text-right text-white">R$ ${valorTotal.toFixed(2).replace('.',',')}</td>
                <td class="py-2 text-right">
                    <button onclick="window.removerPedido('${d.id}')" class="text-red-500 hover:text-red-400 px-2 py-1">
                        <i class="ph-fill ph-x-circle text-lg"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    const valorComDesconto = calcularDescontoGlobal(qtdGeral, totalGeral);

    document.getElementById('pedido-total-qtd').innerText = qtdGeral;
    document.getElementById('pedido-total-valor').innerText = `R$ ${totalGeral.toFixed(2).replace('.',',')}`;
    
    const divDesconto = document.getElementById('linha-desconto-aplicado');
    if(qtdGeral >= 20) {
        divDesconto.classList.remove('hidden');
        document.getElementById('pedido-total-desconto').innerText = `R$ ${valorComDesconto.toFixed(2).replace('.',',')}`;
    } else {
        divDesconto.classList.add('hidden');
    }
}

export function renderCatalogo(marmitas, filtroGrupo = '') {
    cacheMarmitas = marmitas;
    const container = document.getElementById('lista-catalogo');
    const selFiltro = document.getElementById('filtro-catalogo-grupo');
    if (!container) return;

    if (selFiltro && selFiltro.options.length <= 1) {
        const grupos = [...new Set(marmitas.map(m => m.grupo).filter(Boolean))].sort();
        selFiltro.innerHTML = '<option value="">Todos os Grupos</option>' + grupos.map(g => `<option value="${g}">${g}</option>`).join('');
    }

    const filtrado = filtroGrupo ? marmitas.filter(m => m.grupo === filtroGrupo) : marmitas;

    container.innerHTML = filtrado.sort((a,b) => a.nome.localeCompare(b.nome)).map(m => `
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center text-sm">
            <div>
                <p class="font-bold text-white">${m.nome}</p>
                <p class="text-xs text-indigo-400">${m.grupo}</p>
            </div>
            <div class="text-white font-bold bg-slate-900 px-3 py-1 rounded">R$ ${m.preco.toFixed(2).replace('.', ',')}</div>
        </div>
    `).join('');
}

export function renderPessoas(pessoas) {
    const container = document.getElementById('lista-pessoas');
    if (!container) return;
    container.innerHTML = pessoas.map(p => `
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-3">
            <p class="font-bold text-white mb-2">${p.nome}</p>
            <div class="flex gap-1 text-[10px] text-center text-slate-400">
                <div class="bg-slate-900 rounded py-2 flex-1">S<br><span class="text-white font-bold text-sm">${p.seg}</span></div>
                <div class="bg-slate-900 rounded py-2 flex-1">T<br><span class="text-white font-bold text-sm">${p.ter}</span></div>
                <div class="bg-slate-900 rounded py-2 flex-1">Q<br><span class="text-white font-bold text-sm">${p.qua}</span></div>
                <div class="bg-slate-900 rounded py-2 flex-1">Q<br><span class="text-white font-bold text-sm">${p.qui}</span></div>
                <div class="bg-slate-900 rounded py-2 flex-1">S<br><span class="text-white font-bold text-sm">${p.sex}</span></div>
                <div class="bg-slate-900 rounded py-2 flex-1">S<br><span class="text-white font-bold text-sm">${p.sab}</span></div>
                <div class="bg-slate-900 rounded py-2 flex-1">D<br><span class="text-white font-bold text-sm">${p.dom}</span></div>
            </div>
        </div>
    `).join('');
}

export function renderEstoque(pessoas, estoque) {
    const container = document.getElementById('lista-estoque-inputs');
    if (!container) return;
    
    // Adiciona campo de data de hoje por padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('input-novo-inventario-data').value = hoje;

    container.innerHTML = pessoas.map(pessoa => {
        const estPessoa = estoque.filter(e => e.pessoa_id === pessoa.id).reduce((a, b) => a + b.quantidade, 0);
        return `
            <div class="flex justify-between items-center bg-slate-900 p-3 rounded-lg mb-2">
                <span class="font-bold text-white">${pessoa.nome}</span>
                <input type="number" data-pessoaid="${pessoa.id}" value="${estPessoa}" min="0" class="estoque-batch-input w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white text-center font-bold outline-none focus:border-indigo-500">
            </div>
        `;
    }).join('');
}