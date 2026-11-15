import { useMemo, useState } from 'react'
import { ErrorState, LoadingState } from './Status'

const FILTERS = [
  { id: 'todas', label: 'Todos' },
  { id: 'Leste', label: 'Leste' },
  { id: 'Oeste', label: 'Oeste' },
]

export default function Onboarding({ state, onSelect }) {
  const [conference, setConference] = useState('todas')
  const [query, setQuery] = useState('')

  const teams = useMemo(() => state.data ?? [], [state.data])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return teams.filter((team) => {
      const matchesConference = conference === 'todas' || team.conference === conference
      const matchesQuery =
        !term ||
        team.displayName.toLowerCase().includes(term) ||
        team.abbreviation.toLowerCase().includes(term) ||
        team.shortName.toLowerCase().includes(term)
      return matchesConference && matchesQuery
    })
  }, [teams, conference, query])

  return (
    <section className="onboarding">
      <div className="onboarding__intro">
        <p className="eyebrow">Bem-vindo</p>
        <h1>Qual é o teu time?</h1>
        <p>
          Escolhe a tua equipa para acompanhar jogos, resultados e a classificação. A escolha fica
          guardada neste dispositivo e os alertas passam a ser só sobre ela.
        </p>
      </div>

      <div className="onboarding__controls">
        <div className="segmented" role="tablist" aria-label="Filtrar por conferência">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={conference === filter.id}
              className={conference === filter.id ? 'is-active' : undefined}
              onClick={() => setConference(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Procurar time (ex.: Lakers, BOS)"
          aria-label="Procurar time"
        />
      </div>

      {state.loading && <LoadingState label="A carregar os 30 times..." />}
      {state.error && <ErrorState error={state.error} onRetry={state.reload} />}

      {!state.loading && !state.error && (
        <>
          <div className="team-grid">
            {filtered.map((team) => (
              <button
                key={team.id}
                type="button"
                className="team-tile"
                style={{ '--team-color': team.color }}
                onClick={() => onSelect(team)}
              >
                {team.logo && <img src={team.logo} alt="" width="56" height="56" loading="lazy" />}
                <span className="team-tile__name">{team.shortName}</span>
                <span className="team-tile__meta">
                  {team.abbreviation}
                  {team.conference ? ` · ${team.conference}` : ''}
                </span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="empty">Nenhum time encontrado com esse filtro.</p>}
        </>
      )}
    </section>
  )
}
