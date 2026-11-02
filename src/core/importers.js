import { salvarPessoasLote, salvarMarmitasLote } from '../api/repository.js';

export function importarConsumo(file, onSuccess, onError) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = window.XLSX.read(data, {type: 'array'});
            const json = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            
            const pessoaMap = {};
            json.forEach(row => {
                const nome = row['Quem'];
                const diaStr = row['Dia da Semana'] || '';
                const qtd = row['Qtd'] || 0;
                
                if (!nome) return;

                if (!pessoaMap[nome]) {
                     pessoaMap[nome] = { nome, seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0, dom: 0 };
                }

                // Soma o consumo do dia da planilha
                if (diaStr.includes('Seg')) pessoaMap[nome].seg += qtd;
                if (diaStr.includes('Ter')) pessoaMap[nome].ter += qtd;
                if (diaStr.includes('Qua')) pessoaMap[nome].qua += qtd;
                if (diaStr.includes('Qui')) pessoaMap[nome].qui += qtd;
                if (diaStr.includes('Sex')) pessoaMap[nome].sex += qtd;
                if (diaStr.includes('Sáb') || diaStr.includes('Sab')) pessoaMap[nome].sab += qtd;
                if (diaStr.includes('Dom')) pessoaMap[nome].dom += qtd;
            });

            await salvarPessoasLote(Object.values(pessoaMap));
            onSuccess();
        } catch (err) {
            onError(err);
        }
    };
    reader.readAsArrayBuffer(file);
}

export function importarItens(file, onSuccess, onError) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = window.XLSX.read(data, {type: 'array'});
            const json = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            
            const marmitasArray = json
                .filter(row => row['Item']) // Ignora linhas em branco
                .map(row => ({
                    grupo: row['Grupo'] || 'Sem Grupo',
                    nome: row['Item'],
                    preco: parseFloat(row['Valor']) || 0
                }));

            await salvarMarmitasLote(marmitasArray);
            onSuccess();
        } catch (err) {
            onError(err);
        }
    };
    reader.readAsArrayBuffer(file);
}