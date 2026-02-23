// SCRIPT PARA RECEBER LEADS DO AUTO SHOWROOM SAAS NO GOOGLE SHEETS
// REESCRITO PARA TER 1 LINHA POR LEAD: ATUALIZA A DATA E AS COLUNAS SEM DUPLICAR
// =================================================================

function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var body = JSON.parse(e.postData.contents);
        var leadId = body.lead_id;

        // 1. Cria cabeçalho se a planilha estiver vazia (Formato Limpo pedido pelo lojista)
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                "DATA",
                "NOME DO CLIENTE",
                "DATA DE NASCIMENTO",
                "CPF",
                "EMAIL",
                "TELEFONE/WHATSAPP",
                "VEICULO DESEJADO",
                "POSSUI CNH?",
                "RENDA MENSAL",
                "ENTRADA",
                "ID_LEAD_INTERNO" // Coluna K (11) Oculta para o sistema achar a linha na etapa 2
            ]);
            sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#f3f4f6");
            sheet.setFrozenRows(1);
        }

        // 2. Busca se a linha desse Lead já existe na planilha
        var lastRow = sheet.getLastRow();
        var dataRange = sheet.getRange(1, 11, lastRow, 1).getValues();
        var rowIndex = -1;

        for (var i = 1; i < dataRange.length; i++) {
            if (dataRange[i][0] === leadId) {
                rowIndex = i + 1; // +1 porque array começa no 0 e a linha da planilha no 1
                break;
            }
        }

        // 3. Formatação dos dados que chegaram
        var dataFormatada = "";
        if (body.data) {
            var d = new Date(body.data);
            dataFormatada = d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
        } else {
            var d = new Date();
            dataFormatada = d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
        }

        var renda = body.renda_mensal ? "R$ " + Number(body.renda_mensal).toFixed(2).replace('.', ',') : "-";
        var entrada = body.valor_entrada ? "R$ " + Number(body.valor_entrada).toFixed(2).replace('.', ',') : "-";

        var possuiCnh = "";
        if (body.possui_cnh === true) possuiCnh = "SIM";
        else if (body.possui_cnh === false) possuiCnh = "NÃO";
        else possuiCnh = "-";

        // Organiza array igual as colunas: DATA, NOME DO CLIENTE, DATA DE NASCIMENTO, CPF, EMAIL, TELEFONE/WHATSAPP, VEICULO DESEJADO, POSSUI CNH?, RENDA MENSAL, ENTRADA, ID_LEAD_INTERNO
        var newRowData = [
            dataFormatada,
            body.nome || "-",
            body.data_nascimento || "-",
            body.cpf || "-",
            body.email || "-",
            body.whatsapp || "-",
            body.veiculo_nome || "-",
            possuiCnh,
            renda,
            entrada,
            leadId || "-"
        ];

        if (rowIndex > -1) {
            // Se já existe, apenas ATUALIZA a linha em vez de criar outra (Resolve a duplicação - Etapa 1 e Etapa 2 ficam numa só)
            sheet.getRange(rowIndex, 1, 1, 11).setValues([newRowData]);
        } else {
            // Se não existe, CRIA uma nova linha
            sheet.appendRow(newRowData);
        }

        // Redimensiona do 1 ao 10, deixa a 11 do ID quietinha
        sheet.autoResizeColumns(1, 10);

        // Esconde a coluna "11" (ID_LEAD_INTERNO) pra não incomodar a visualização da loja
        sheet.hideColumns(11);

        return ContentService.createTextOutput(JSON.stringify({ "status": "sucesso" })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "status": "erro", "mensagem": error.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}
