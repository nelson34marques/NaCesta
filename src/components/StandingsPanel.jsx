import { ErrorState, LoadingState } from './Status'
import { formatPct } from '../lib/format'

export default function StandingsPanel({ state, favoriteTeamId }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Temporada regular</p>
          <h2>Classificação por conferência</h2>
        </div>
      </div>

      {state.loading && <LoadingState label="A carregar a classificação..." />}
      {state.error && <ErrorState error={state.error} onRetry={state.reload} />}

      {!state.loading && !state.error && (
        <div className="standings-grid">
          {(state.data ?? []).map((conference) => (
            <div key={conference.id} className="standings">
              <header className="standings__head">
                <div>
                  <h3>Conferência {conference.name}</h3>
                  <span className="muted">Temporada {conference.season}</span>
                </div>
                <span className="standings__leader">
                  Líder: {conference.teams[0]?.shortName ?? '—'}
                </span>
              </header>

              <div className="standings__scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Time</th>
                      <th scope="col">V-D</th>
                      <th scope="col">%</th>
                      <th scope="col">GB</th>
                      <th scope="col">Seq.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conference.teams.map((row) => (
                      <tr
                        key={row.id}
                        className={row.id === favoriteTeamId ? 'is-favorite' : undefined}
                      >
                        <td>
                          <span className={row.seed === 1 ? 'rank is-leader' : 'rank'}>
                            {row.seed}
                          </span>
                        </td>
                        <td>
                          <span className="standings__team">
                            {row.logo && (
                              <img src={row.logo} alt="" width="22" height="22" loading="lazy" />
                            )}
                            <span>{row.abbreviation}</span>
                            {row.seed === 1 && <span className="leader-tag">Líder</span>}
                          </span>
                        </td>
                        <td>{row.record}</td>
                        <td>{formatPct(row.pct)}</td>
                        <td>{row.gamesBehind ?? '—'}</td>
                        <td>{row.streak ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="panel__foot">
        Ordenação por percentagem de vitórias. Líder = 1º colocado da conferência.
      </p>
    </section>
  )
}
