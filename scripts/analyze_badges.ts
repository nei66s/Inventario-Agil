import dotenv from 'dotenv';
dotenv.config();
import { query } from '../src/lib/db';

async function run() {
    try {
        const q1 = `EXPLAIN ANALYZE SELECT 
         COUNT(DISTINCT CASE 
           WHEN o.trashed_at IS NULL 
            AND lower(coalesce(o.status, '')) NOT IN ('finalizado', 'saida_concluida') 
           THEN o.id END) as orders,
           
         COUNT(DISTINCT CASE 
           WHEN o.trashed_at IS NULL 
            AND lower(coalesce(o.status, '')) IN ('em_picking', 'aberto', 'saida_concluida') 
           THEN o.id END) as picking,
           
         (SELECT COUNT(*) 
          FROM production_tasks pt
          LEFT JOIN orders po ON po.id = pt.order_id
          WHERE po.trashed_at IS NULL
            AND (po.status IS NULL OR lower(po.status) NOT IN ('cancelado', 'finalizado'))
            AND pt.tenant_id = '8add14d8-1c58-412d-bfe4-1f720c74bdba'::uuid
            AND pt.status <> 'DONE'
            AND NOT (
              lower(coalesce(po.status, '')) IN ('rascunho', 'draft')
              AND lower(coalesce(po.source, '')) NOT LIKE 'mrp%'
            )
         ) as production
       FROM orders o
       WHERE o.tenant_id = '8add14d8-1c58-412d-bfe4-1f720c74bdba'::uuid`;
        const r1 = await query(q1);
        console.log('QUERY 1:');
        console.log(r1.rows.map(r => r['QUERY PLAN']).join('\n'));
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
run();
