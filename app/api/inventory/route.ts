import { NextResponse } from 'next/server';
import pool from '@/lib/db';

type DbRow = {
  id: number;
  sku: string | null;
  name: string;
  unit: string | null;
  min_stock: number | null;
  reorder_point: number | null;
  setup_time_minutes: number | null;
  production_time_per_unit_minutes: number | null;
  color_options: unknown;
  reserved_total: string | number | null;
  on_hand: string | number | null;
};

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query<DbRow>(`
        SELECT
          m.id,
          m.sku,
          m.name,
          m.unit,
          m.min_stock,
          m.reorder_point,
          m.setup_time_minutes,
          m.production_time_per_unit_minutes,
          m.color_options,
          COALESCE((
            SELECT SUM(
              GREATEST(
                0::NUMERIC,
                req.requested_qty - COALESCE(pt.qty_to_produce, 0::NUMERIC)
              )
            )
            FROM (
              SELECT oi2.order_id, oi2.material_id, SUM(oi2.quantity)::NUMERIC(12,4) AS requested_qty
              FROM order_items oi2
              JOIN orders o2 ON o2.id = oi2.order_id
              WHERE oi2.material_id = m.id
                AND (o2.status IS NULL OR lower(o2.status) NOT IN ('draft', 'cancelado', 'finalizado'))
              GROUP BY oi2.order_id, oi2.material_id
            ) req
            LEFT JOIN production_tasks pt
              ON pt.order_id = req.order_id
             AND pt.material_id = req.material_id
          ),0) AS reserved_total,
          COALESCE(sb.on_hand,0) AS on_hand
        FROM materials m
        LEFT JOIN stock_balances sb ON sb.material_id = m.id
        GROUP BY m.id, sb.on_hand
        ORDER BY m.id
      `);

      const materials = res.rows.map((r) => ({
        id: `M-${r.id}`,
        name: r.name,
        standardUom: r.unit ?? 'UN',
        minStock: Number(r.min_stock ?? 0),
        reorderPoint: Number(r.reorder_point ?? 0),
        setupTimeMinutes: Number(r.setup_time_minutes ?? 0),
        productionTimePerUnitMinutes: Number(r.production_time_per_unit_minutes ?? 0),
        colorOptions: Array.isArray(r.color_options) ? r.color_options : [],
      }));

      const stockBalances = res.rows.map((r) => ({
        materialId: `M-${r.id}`,
        onHand: Number(r.on_hand ?? 0),
        reservedTotal: Number(r.reserved_total ?? 0),
      }));

      const payload = {
        materials,
        stockBalances,
        stockReservations: [],
      };

      return NextResponse.json(payload);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('inventory API error', err);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
