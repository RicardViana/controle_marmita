export function calcularNecessidade(pessoa, config, estoqueAtual) {
    if (!config || !config.data_proxima_compra || !config.data_inventario) {
        return { qtdMes: 0, estoque: estoqueAtual, qtdCompra: 0 };
    }
    
    const dataAtual = new Date(config.data_inventario + 'T00:00:00');
    const proxima = new Date(config.data_proxima_compra + 'T00:00:00');
    
    let totalNecessario = 0;
    const mapaDias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    
    // CORREÇÃO APLICADA: <= garante que o último dia (dia 25) seja contado como no Excel
    while (dataAtual <= proxima) {
        const diaDaSemana = dataAtual.getDay();
        totalNecessario += Number(pessoa[mapaDias[diaDaSemana]]) || 0;
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    const qtdCompra = totalNecessario - estoqueAtual;
    return { 
        qtdMes: totalNecessario, 
        estoque: estoqueAtual, 
        qtdCompra: qtdCompra > 0 ? qtdCompra : 0 
    };
}

export function calcularDescontoGlobal(qtdTotal, valorTotal) {
    // Regras matemáticas extraídas da sua fórmula =LET() do Excel
    if (qtdTotal < 20) return valorTotal;
    if (qtdTotal >= 20 && qtdTotal < 30) return valorTotal * 0.90; // 10%
    if (qtdTotal >= 30 && qtdTotal < 40) return valorTotal * 0.88; // 12%
    return valorTotal * 0.85; // 15%
}

export function calcularProximaCompraAutomatica(dataCompraStr) {
    if (!dataCompraStr) return '';
    const [ano, mes] = dataCompraStr.split('-');
    let proximoMes = parseInt(mes, 10); 
    let anoCalc = parseInt(ano, 10);
    
    if (proximoMes === 12) { proximoMes = 0; anoCalc += 1; }
    
    let dataBase = new Date(anoCalc, proximoMes, 25);
    let diaSem = dataBase.getDay();
    if (diaSem === 5 || diaSem === 0) dataBase.setDate(dataBase.getDate() + 1);
    
    return dataBase.toISOString().split('T')[0];
}

export function calcularEncerramento(pessoa, dataInicioStr, estoqueInicial) {
    if (!dataInicioStr || estoqueInicial <= 0) return '--/--/----';
    const consumoTotal = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].reduce((sum, d) => sum + (Number(pessoa[d]) || 0), 0);
    if (consumoTotal === 0) return 'Sem Consumo'; 
    
    let estoqueAtual = estoqueInicial;
    let dataAtual = new Date(dataInicioStr + 'T00:00:00');
    dataAtual.setDate(dataAtual.getDate() - 1); 
    const mapaDias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    
    while (estoqueAtual > 0) {
        dataAtual.setDate(dataAtual.getDate() + 1);
        const diaDaSemana = dataAtual.getDay();
        const consumoDia = Number(pessoa[mapaDias[diaDaSemana]]) || 0;
        if (consumoDia > 0) estoqueAtual -= consumoDia;
    }
    
    const [ano, mes, dia] = dataAtual.toISOString().split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}