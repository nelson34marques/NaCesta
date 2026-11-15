export function LoadingState({ label = 'A carregar...' }) {
  return (
    <div className="feedback" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="feedback feedback--error" role="alert">
      <p>{error?.message ?? 'Não foi possível carregar os dados.'}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }) {
  return <p className="empty">{children}</p>
}
