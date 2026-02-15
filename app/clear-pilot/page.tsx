'use client'

import React from 'react'

export default function ClearPilotPage() {
  const [status, setStatus] = React.useState<'idle'|'cleared'|'not-found'>('idle')

  React.useEffect(() => {
    try {
      const key = 'inventario-agil-pilot-db-v1'
      if (typeof window !== 'undefined') {
        const had = window.localStorage.getItem(key) !== null
        window.localStorage.removeItem(key)
        setStatus(had ? 'cleared' : 'not-found')
      }
    } catch (err) {
      setStatus('not-found')
    }
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Limpar dados do modo piloto</h1>
      {status === 'idle' && <p>Processando...</p>}
      {status === 'cleared' && (
        <>
          <p>Dados do piloto removidos do localStorage.</p>
          <p>Recarregue a aplicação para ver os efeitos.</p>
        </>
      )}
      {status === 'not-found' && (
        <>
          <p>Nenhum dado de piloto encontrado — já estava limpo.</p>
        </>
      )}
    </div>
  )
}
