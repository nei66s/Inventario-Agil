import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload } from '@/lib/auth';
import { query } from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
    try {
        const { ticketId } = await params;
        const auth = getAuthPayload(req);
        if (!auth) return NextResponse.json({ messages: [] }, { status: 401 });

        const res = await query(
            `SELECT id, sender_type, message, attachment_data, created_at 
             FROM support_messages 
             WHERE ticket_id = $1 
             ORDER BY created_at ASC`,
            [ticketId]
        );

        return NextResponse.json({ messages: res.rows });
    } catch (err) {
        console.error('[Support Messages GET Error]', err);
        return NextResponse.json({ messages: [] }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
    try {
        const { ticketId } = await params;
        const auth = getAuthPayload(req);
        if (!auth) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

        const body = await req.json();
        const { message, attachment_data } = body;

        // Insert message
        const res = await query(
            `INSERT INTO support_messages (ticket_id, sender_type, message, attachment_data) 
             VALUES ($1, 'USER', $2, $3) RETURNING *`,
            [ticketId, message, attachment_data || null]
        );

        // Notify Telegram
        const userRes = await query(
            `SELECT u.name as user_name, u.email, t.name as tenant_name 
             FROM users u 
             LEFT JOIN tenants t ON u.tenant_id = t.id 
             WHERE u.id = $1 LIMIT 1`,
            [auth.userId]
        );
        
        let userInfoStr = 'Usuário Desconhecido';
        if (userRes.rows.length > 0) {
            const user = userRes.rows[0];
            userInfoStr = `👤 **Usuário:** ${user.user_name} (${user.email})\n🏢 **Empresa:** ${user.tenant_name || 'Desconhecida'}`;
        }

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'IP Desconhecido';
        
        let telegramMsg = `🔔 **Nova Mensagem do Chat!**\n\n` +
                          `${userInfoStr}\n\n` +
                          `💬 **Mensagem:**\n${message}\n\n` +
                          `📍 IP: \`${ip}\``;

        telegramMsg += `\n\n\`#Ticket:${ticketId}\``;

        await sendTelegramMessage(telegramMsg, attachment_data || undefined);

        return NextResponse.json({ success: true, message: res.rows[0] });
    } catch (err) {
        console.error('[Support Messages POST Error]', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
