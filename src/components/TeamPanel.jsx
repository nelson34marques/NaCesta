import GameCard from './GameCard'
import { EmptyState, ErrorState, LoadingState } from './Status'
import { nextGameFor, recentResults, upcomingGames } from '../lib/games'

export default function TeamPanel({ state, team, standing }) {
  const games = state.data ?? []
  const nextGame = nextGameFor(games)
  const upcoming = upcomingGames(games, 7)
    .filter((game) => game.id !== nextGame?.id)
    .slice(0, 5)
  const results = recentResults(games, 6)

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Agenda da equipa</p>
          <h2>{team.displayName}</h2>
        </div>
        {standing && (
          <span className="badge">
            {standing.conference} · {standing.record}
          </span>
        )}
      </div>

      {state.loading && !state.data && <LoadingState label="A carregar a agenda do time..." />}
      {state.error && !state.data && <ErrorState error={state.error} onRetry={state.reload} />}

      {state.data && (
        <div className="panel__columns">
          <div>
            <h3 className="section-title">Próximos jogos</h3>
            {nextGame ? (
              <>
                <GameCard game={nextGame} favoriteTeamId={team.id} emphasize showDate />
                <div className="game-stack">
                  {upcoming.map((game) => (
                    <GameCard key={game.id} game={game} favoriteTeamId={team.id} showDate />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState>Sem jogos futuros na agenda.</EmptyState>
            )}
          </div>

          <div>
            <h3 className="section-title">Resultados recentes</h3>
            {results.length > 0 ? (
              <div className="game-stack">
                {results.map((game) => (
                  <GameCard key={game.id} game={game} favoriteTeamId={team.id} showDate />
                ))}
              </div>
            ) : (
              <EmptyState>Ainda não há resultados esta temporada.</EmptyState>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
