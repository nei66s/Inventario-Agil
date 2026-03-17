import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const auth = getAuthPayload(req);
        if (!auth) return NextResponse.json({ tickets: [] }, { status: 401 });

        const res = await query(
            `SELECT id, title, created_at, status 
             FROM support_tickets 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [auth.userId]
        );

        return NextResponse.json({ tickets: res.rows });
    } catch (err) {
        console.error('[Support GET Error]', err);
        return NextResponse.json({ tickets: [] }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = getAuthPayload(req);
        if (!auth) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

        const body = await req.json();
        
        const title = body.title || 'Novo Chat';

        const res = await query(
            `INSERT INTO support_tickets (tenant_id, user_id, title) 
             VALUES ($1, $2, $3) RETURNING id`,
            [auth.tenantId, auth.userId, title]
        );

        return NextResponse.json({ ticketId: res.rows[0].id });
    } catch (err) {
        console.error('[Support POST Error]', err);
        return NextResponse.json({ message: 'Erro ao criar ticket' }, { status: 500 });
    }
}
