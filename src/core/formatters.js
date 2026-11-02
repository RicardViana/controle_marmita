export function aplicarMascaraMoeda(valorString) {
    let value = valorString.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (value === "") value = "0";
    
    // Converte para float dividindo por 100 para criar as casas decimais
    value = (parseInt(value, 10) / 100).toFixed(2) + ''; 
    value = value.replace(".", ",");
    
    // Adiciona o separador de milhar
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); 
    
    return value === "0,00" ? "" : "R$ " + value;
}