import { checkSession } from './api/auth.js';
import { getPessoas, getConfiguracoes, getEstoque, getMarmitas, getDistribuicao } from './api/repository.js';
import { calcularNecessidade } from './core/calculators.js';
import { renderDashboard, renderCatalogo, renderPessoas, renderEstoque, renderSelectsPedido, renderTabelaPedido } from './ui/render.js';
import { setupAuthEvents } from './ui/events.js';

async function initApp() {
    setupAuthEvents();
    try {
        const session = await checkSession();
        if (session) {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            
            // Seta o mês atual como padrão no input
            const hm = new Date();
            const mesStr = hm.getFullYear() + '-' + String(hm.getMonth() + 1).padStart(2, '0');
            if(document.getElementById('filtro-mes-pedido')) document.getElementById('filtro-mes-pedido').value = mesStr;

            await carregarDadosGlobais();
        } else {
            document.getElementById('auth-screen').classList.remove('hidden');
            document.getElementById('app-layout').classList.add('hidden');
        }
    } catch (error) { console.error("Erro:", error); }
}

export async function carregarDadosGlobais() {
    try {
        const [pessoas, marmitas, config, estoque, distribuicao] = await Promise.all([
            getPessoas(), getMarmitas(), getConfiguracoes(), getEstoque(), getDistribuicao()
        ]);

        const mesFiltro = document.getElementById('filtro-mes-pedido') ? document.getElementById('filtro-mes-pedido').value : '';
        const grupoFiltro = document.getElementById('filtro-catalogo-grupo') ? document.getElementById('filtro-catalogo-grupo').value : '';

        renderDashboard(pessoas, config, estoque, calcularNecessidade);
        renderCatalogo(marmitas, grupoFiltro);
        renderPessoas(pessoas);
        renderEstoque(pessoas, estoque);
        renderSelectsPedido(pessoas, marmitas);
        renderTabelaPedido(distribuicao, mesFiltro);

        if(config) {
            if(config.data_inventario) document.getElementById('input-dash-inv').value = config.data_inventario;
            if(config.data_compra) document.getElementById('input-dash-compra').value = config.data_compra;
            if(config.data_proxima_compra) document.getElementById('input-dash-prox').value = config.data_proxima_compra;
        }
    } catch (error) { console.error("Erro ao carregar DB:", error); }
}

initApp();