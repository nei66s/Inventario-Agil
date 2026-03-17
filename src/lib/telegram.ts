/**
 * Utilitário para envio de mensagens via Telegram Bot API
 */

export async function sendTelegramMessage(message: string, base64Image?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatIdsEnv = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatIdsEnv) {
        console.warn('[Telegram] Token ou Chat ID não configurados.');
        return;
    }

    const chatIds = chatIdsEnv.split(',').map((id) => id.trim());
    const isImage = base64Image && base64Image.startsWith('data:image/');

    for (const chatId of chatIds) {
        if (!chatId) continue;
        try {
            if (isImage) {
                // Extrai a parte base64 e o tipo da imagem
                const matches = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
                if (!matches) {
                    throw new Error('Formato base64 inválido');
                }
                const mimeType = matches[1];
                const data = matches[2];
                
                // Converte de base64 para Buffer e depois para Blob para o fetch () do Node 18+
                const buffer = Buffer.from(data, 'base64');
                const blob = new Blob([buffer], { type: mimeType });
                
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('caption', message);
                formData.append('parse_mode', 'Markdown');
                formData.append('photo', blob, 'screenshot.jpeg');

                const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error(`[Telegram Photo] Erro ao enviar para ${chatId}:`, error);
                }
            } else {
                const url = `https://api.telegram.org/bot${token}/sendMessage`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'Markdown',
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error(`[Telegram] Erro ao enviar mensagem para ${chatId}:`, error);
                }
            }
        } catch (err) {
            console.error(`[Telegram] Erro de rede para ${chatId}:`, err);
        }
    }
}
