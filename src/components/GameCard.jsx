import { formatShortDate, formatTime } from '../lib/format'

function statusLabel(status) {
  if (status.state === 'in') {
    if (status.shortDetail) return status.shortDetail
    const period = status.period ? `${status.period}º` : ''
    return [status.clock, period].filter(Boolean).join(' · ') || 'Ao vivo'
  }
  if (status.state === 'post') return status.detail || 'Final'
  return 'Agendado'
}

export default function GameCard({ game, favoriteTeamId, emphasize = false, showDate = false }) {
  const isFavoriteGame = game.competitors.some((team) => team.id === favoriteTeamId)
  const hasScores = game.status.state !== 'pre'

  const classes = ['game-card']
  if (emphasize) classes.push('game-card--featured')
  if (isFavoriteGame) classes.push('is-favorite')

  return (
    <article className={classes.join(' ')}>
      <header className="game-card__head">
        <span className={`pill pill--${game.status.state}`}>{statusLabel(game.status)}</span>
        <span className="game-card__when">
          {showDate && `${formatShortDate(game.date)} · `}
          {formatTime(game.date)}
        </span>
      </header>

      <ul className="game-card__teams">
        {game.competitors.map((team) => {
          const classes = ['game-card__team']
          if (team.winner) classes.push('is-winner')
          if (team.id === favoriteTeamId) classes.push('is-favorite')

          return (
            <li key={team.id} className={classes.join(' ')}>
              {team.logo && <img src={team.logo} alt="" width="34" height="34" loading="lazy" />}
              <span className="game-card__team-name">
                <strong>{team.shortName || team.abbreviation}</strong>
                <span>{team.record ?? team.displayName}</span>
              </span>
              <span className="game-card__score">
                {hasScores
                  ? (team.score ?? '–')
                  : team.homeAway === 'home'
                    ? 'Casa'
                    : 'Fora'}
              </span>
            </li>
          )
        })}
      </ul>

      {(game.venue || game.broadcast) && (
        <footer className="game-card__foot">
          <span>{game.venue ?? 'Local a definir'}</span>
          {game.broadcast && <span>{game.broadcast}</span>}
        </footer>
      )}
    </article>
  )
}
