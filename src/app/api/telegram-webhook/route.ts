import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Se for um webhook do Telegram (Nova mensagem)
        if (body.message && body.message.reply_to_message) {
            const originalText = body.message.reply_to_message.caption || body.message.reply_to_message.text || '';
            const replyText = body.message.text || '';
            const chatId = body.message.chat.id.toString();

            // Pega o token atual para ter certeza que veio dos chats permitidos
            const allowedChatIds = (process.env.TELEGRAM_CHAT_ID || '').split(',');
            if (!allowedChatIds.includes(chatId)) {
                return NextResponse.json({ success: false, reason: 'Chat ID not allowed' }, { status: 403 });
            }

            // Tenta extrair o Ticket ID (tanto do texto ou da legenda da foto)
            const ticketMatch = originalText.match(/#Ticket:([a-f0-9\-]+)/);
            if (ticketMatch && ticketMatch[1]) {
                const ticketId = ticketMatch[1];
                
                // Verifica se o ticket existe
                const ticketRes = await query('SELECT id, status FROM support_tickets WHERE id = $1', [ticketId]);
                
                if (ticketRes.rows.length > 0) {
                    const ticketData = ticketRes.rows[0];
                    const commandText = replyText.trim().toLowerCase();
                    
                    if (commandText === '/resolver') {
                        // Comando: Fechar o Ticket
                        await query(
                            `UPDATE support_tickets SET status = 'CLOSED', updated_at = NOW() WHERE id = $1`,
                            [ticketId]
                        );
                        await sendTelegramMessage(`✅ O Ticket \`${ticketId}\` foi marcado como *Resolvido*.`);
                    } else if (commandText === '/abrir') {
                         // Comando: Reabrir o Ticket
                        await query(
                            `UPDATE support_tickets SET status = 'OPEN', updated_at = NOW() WHERE id = $1`,
                            [ticketId]
                        );
                        await sendTelegramMessage(`🔄 O Ticket \`${ticketId}\` foi *Reaberto*.`);
                    } else {
                        // Mensagem normal do admin para o usuário
                        await query(
                            `INSERT INTO support_messages (ticket_id, sender_type, message) 
                             VALUES ($1, 'ADMIN', $2)`,
                            [ticketId, replyText]
                        );
                        
                        // Se mandou mensagem e estava fechado, ele tenta reabrir pra rolar a conversa.
                        if (ticketData.status === 'CLOSED') {
                             await query(
                                `UPDATE support_tickets SET status = 'OPEN', updated_at = NOW() WHERE id = $1`,
                                [ticketId]
                            );
                        }

                        // Avisa que a mensagem foi entregue pro usuário (Feedback pra vc)
                        await sendTelegramMessage(`📤 Resposta entregue ao usuário no App.\nTicket: \`${ticketId}\``);
                    }
                } else {
                    await sendTelegramMessage(`❌ Falha: O Ticket \`${ticketId}\` não foi encontrado no banco de dados da aplicação.`);
                }
            } else {
                 // Apenas não faz nada caso seja uma reposta para outro bot
            }
        } else if (body.message && body.message.text) {
            // Comandos Globais (Aquelas mensagens enviadas diretamente pro Bot, e não dando "Reply" a algo)
            const text = body.message.text.trim().toLowerCase();
            const chatId = body.message.chat.id.toString();

            const allowedChatIds = (process.env.TELEGRAM_CHAT_ID || '').split(',');
            if (allowedChatIds.includes(chatId)) {
                if (text === '/pendentes' || text === '/chamados') {
                    const openTicketsRes = await query(`
                        SELECT t.id, t.title, t.created_at, u.name as user_name, ten.name as tenant_name
                        FROM support_tickets t
                        JOIN users u ON t.user_id::text = u.id::text
                        LEFT JOIN tenants ten ON t.tenant_id::text = ten.id::text
                        WHERE t.status = 'OPEN'
                        ORDER BY t.created_at DESC
                    `);

                    if (openTicketsRes.rows.length === 0) {
                        await sendTelegramMessage('🎉 *Sua fila está zerada!* Nenhum chamado pendente no momento. Bom trabalho!');
                    } else {
                        let msg = `🚨 Você tem *${openTicketsRes.rows.length} chamado(s)* pendente(s):\n\n`;
                        
                        openTicketsRes.rows.forEach(t => {
                            msg += `📌 *${t.title}*\n`;
                            msg += `🏢 ${t.tenant_name || 'Sem Empresa'} | 👤 ${t.user_name || 'Usuário'}\n`;
                            msg += `🕒 ${new Date(t.created_at).toLocaleString('pt-BR')}\n`;
                            msg += `\n\`#Ticket:${t.id}\`\n`;
                            msg += `〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n`;
                        });
                        
                        msg += `_Para responder qualquer ticket, basta dar "Responder" (Reply) em uma notificação antiga ou na que tem a tag do ticket._`;
                        await sendTelegramMessage(msg);
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Telegram Webhook Error]', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
