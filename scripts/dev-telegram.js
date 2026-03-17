require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function run() {
    if (!botToken) {
        console.error('ERRO: TELEGRAM_BOT_TOKEN não está definido.');
        return;
    }

    try {
        console.log('--- TESTE LOCAL DO TELEGRAM ---');
        console.log('1. Desativando Webhook Oficial temporariamente...');
        await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);

        console.log('✔️ Webhook removido. Escutando mensagens que chegarem no seu Bot do Telegram...');
        console.log('Dica: Use ctrl+c para parar esse script.');

        let offset = 0;
        
        setInterval(async () => {
            try {
                const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?timeout=10&offset=${offset}`);
                const data = await res.json();
                
                if (data.ok && data.result.length > 0) {
                    for (const update of data.result) {
                        offset = update.update_id + 1;
                        if (update.message) {
                            console.log(`\n📬 [NOVA MENSAGEM RECEBIDA VIA TELEGRAM]`);
                            console.log(`De: ${update.message.from?.first_name} | Texto: "${update.message.text}"`);
                            
                            // Manda pro nosso endpoint local simulando o webhook!
                            console.log('➡️  Enviando para o Servidor Local (localhost:3000)...');
                            const response = await fetch('http://localhost:3000/api/telegram-webhook', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ message: update.message })
                            });
                            
                            const apiResult = await response.json();
                            if (apiResult.success) {
                                console.log('✅ Localhost processou e guardou no banco de dados!');
                            } else {
                                console.log('⚠️ Localhost ignorou essa mensagem (talvez não tivesse o #Ticket ou chat_id bloqueado).');
                            }
                        }
                    }
                }
            } catch (err) {
                // ignorar timeout silently
            }
        }, 3000); // Tentar a cada 3 segundos

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

run();
