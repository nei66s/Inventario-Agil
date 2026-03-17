import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    const awaitedParams = (await params) as { id: string };
    const targetId = awaitedParams.id;
    if (auth.role !== 'Admin' && auth.userId !== targetId) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get('avatar') as unknown;
    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json({ message: 'Arquivo invalido' }, { status: 400 });
    }

    const arrayBuffer = await (file as any).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to base64
    const mimeType = (file as any).type || 'image/png';
    const base64String = buffer.toString('base64');
    const avatarUrl = `data:${mimeType};base64,${base64String}`;

    await query('UPDATE users SET avatar_url = $1 WHERE id = $2 AND tenant_id = $3', [avatarUrl, targetId, auth.tenantId]);

    revalidateTag(`user-${targetId}`);

    return NextResponse.json({ avatarUrl });
  } catch (err) {
    console.error('avatar upload error', err);
    return NextResponse.json({ message: 'Erro ao enviar avatar' }, { status: 500 });
  }
}
