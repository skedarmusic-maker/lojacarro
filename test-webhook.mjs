const webhook_url = 'https://script.google.com/macros/s/AKfycbxGMDDME0UDu3VP52hBCwgP4wI8eKiAAKnjJu4gEBMN7xY3qIdG-damIANW7eUaRnOg/exec';

async function testWebhook() {
    try {
        console.log("Enviando POST para:", webhook_url);
        const res = await fetch(webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origem: 'Teste Automático',
                data: new Date().toISOString(),
                loja_nome: 'Carros',
                veiculo_id: null,
                lead_id: '123-abc',
                nome: 'João Teste',
                whatsapp: '1199999999',
                email: 'teste@email.com',
                cpf: '000.111.222-33',
                data_nascimento: null,
                renda_mensal: 5000,
                valor_entrada: 1000
            })
        });

        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (err) {
        console.error("Erro no Webhook:", err);
    }
}
testWebhook();
