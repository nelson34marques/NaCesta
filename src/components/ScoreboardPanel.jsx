import GameCard from './GameCard'
import { EmptyState, ErrorState, LoadingState } from './Status'
import { addDays, dayLabel, formatLongDate } from '../lib/format'

export default function ScoreboardPanel({ state, date, onChangeDate, favoriteTeamId }) {
  const games = state.data ?? []
  const favoriteGames = favoriteTeamId
    ? games.filter((game) => game.competitors.some((team) => team.id === favoriteTeamId))
    : []
  const otherGames = games.filter((game) => !favoriteGames.includes(game))
  const isToday = dayLabel(date) === 'Hoje'

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Agenda</p>
          <h2>
            {dayLabel(date)} <span className="muted">· {formatLongDate(date)}</span>
          </h2>
        </div>

        <div className="date-nav">
          <button
            type="button"
            className="date-nav__arrow"
            onClick={() => onChangeDate(addDays(date, -1))}
            aria-label="Dia anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => onChangeDate(new Date())}
            disabled={isToday}
          >
            Hoje
          </button>
          <button
            type="button"
            className="date-nav__arrow"
            onClick={() => onChangeDate(addDays(date, 1))}
            aria-label="Dia seguinte"
          >
            ›
          </button>
        </div>
      </div>

      {state.loading && !state.data && <LoadingState label="A carregar os jogos..." />}
      {state.error && !state.data && <ErrorState error={state.error} onRetry={state.reload} />}

      {state.data && (
        <>
          {games.length === 0 && <EmptyState>Sem jogos da NBA nesta data.</EmptyState>}

          {favoriteGames.length > 0 && (
            <div className="game-stack">
              {favoriteGames.map((game) => (
                <GameCard key={game.id} game={game} favoriteTeamId={favoriteTeamId} emphasize />
              ))}
            </div>
          )}

          {otherGames.length > 0 && (
            <div className="game-grid">
              {otherGames.map((game) => (
                <GameCard key={game.id} game={game} favoriteTeamId={favoriteTeamId} />
              ))}
            </div>
          )}
        </>
      )}

      <p className="panel__foot">
        Fonte: ESPN · atualiza a cada 15s com jogos ao vivo e a cada 60s nos restantes momentos.
      </p>
    </section>
  )
}
