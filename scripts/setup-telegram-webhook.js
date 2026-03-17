require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blacktowerx.com.br';

async function setupWebhook() {
    if (!botToken) {
        console.error('ERRO: TELEGRAM_BOT_TOKEN não está definido no arquivo .env');
        return;
    }

    const webhookUrl = `${appUrl}/api/telegram-webhook`;
    const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

    console.log(`Configurando Webhook do Telegram para apontar para: ${webhookUrl}...`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.ok) {
            console.log('✅ Webhook configurado com sucesso no Telegram!');
            console.log('Agora as respostas que você der no bot chegarão no sistema do Inventário Ágil.');
        } else {
            console.error('❌ Falha ao configurar Webhook:', data);
        }
    } catch (error) {
        console.error('Erro na requisição para o Telegram:', error);
    }
}

setupWebhook();
