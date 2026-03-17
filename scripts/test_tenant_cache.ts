import 'dotenv/config';
import { getOrCacheTenantResolution } from '../src/lib/tenant-context';
import { tenantStorage } from '../src/lib/tenant-context';

let callCount = 0;

// Simula o que getTenantFromSession faz (headers + JWT verify)
async function mockResolver(): Promise<string | null> {
  callCount++;
  // Simula I/O async (headers + jwt.verify)
  await new Promise(r => setTimeout(r, 5));
  return 'tenant-123';
}

async function run() {
  console.log('=== Teste sem contexto de requisição (sem ALS) ===');
  callCount = 0;
  
  // Sem contexto: cada chamada deve resolver individualmente
  await getOrCacheTenantResolution(mockResolver);
  await getOrCacheTenantResolution(mockResolver);
  await getOrCacheTenantResolution(mockResolver);
  
  console.log(`Chamadas ao resolver SEM contexto: ${callCount} (esperado: 3)`);
  
  console.log('\n=== Teste COM contexto de requisição (com ALS) ===');
  callCount = 0;
  
  // Com contexto de requisição simulado
  await tenantStorage.run({ tenantId: '' }, async () => {
    // 3 chamadas em paralelo (como Promise.all de queries)
    await Promise.all([
      getOrCacheTenantResolution(mockResolver),
      getOrCacheTenantResolution(mockResolver),
      getOrCacheTenantResolution(mockResolver),
    ]);
    
    // + mais 2 chamadas sequenciais depois
    await getOrCacheTenantResolution(mockResolver);
    await getOrCacheTenantResolution(mockResolver);
  });
  
  console.log(`Chamadas ao resolver COM contexto: ${callCount} (esperado: 1)`);
  
  console.log('\n=== Verificando resultado correto ===');
  const result = await tenantStorage.run({ tenantId: '' }, async () => {
    return getOrCacheTenantResolution(mockResolver);
  });
  console.log(`Tenant retornado: ${result} (esperado: tenant-123)`);
  
  console.log('\n=== Teste de isolamento entre requests ===');
  callCount = 0;
  
  // Dois "requests" diferentes devem ter caches independentes
  await Promise.all([
    tenantStorage.run({ tenantId: '' }, async () => {
      await getOrCacheTenantResolution(mockResolver);
      await getOrCacheTenantResolution(mockResolver);
    }),
    tenantStorage.run({ tenantId: '' }, async () => {
      await getOrCacheTenantResolution(mockResolver);
      await getOrCacheTenantResolution(mockResolver);
    }),
  ]);
  
  console.log(`Chamadas com 2 requests isolados: ${callCount} (esperado: 2 - 1 por request)`);

  process.exit(0);
}

run().catch(console.error);
