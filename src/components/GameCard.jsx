import { useState } from 'react'
import { fetchGameLeaders } from '../api/espn'
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
  const canShowLeaders = game.status.state === 'post'

  const [expanded, setExpanded] = useState(false)
  const [leaders, setLeaders] = useState(null)
  const [loadingLeaders, setLoadingLeaders] = useState(false)
  const [leadersError, setLeadersError] = useState(null)

  async function toggleLeaders() {
    if (!canShowLeaders) return
    const next = !expanded
    setExpanded(next)
    if (next && !leaders && !loadingLeaders) {
      setLoadingLeaders(true)
      setLeadersError(null)
      try {
        const data = await fetchGameLeaders(game.id)
        setLeaders(data)
      } catch (error) {
        setLeadersError(error?.message ?? 'Não foi possível carregar os destaques.')
      } finally {
        setLoadingLeaders(false)
      }
    }
  }

  const classes = ['game-card']
  if (emphasize) classes.push('game-card--featured')
  if (isFavoriteGame) classes.push('is-favorite')
  if (canShowLeaders) classes.push('is-clickable')
  if (expanded) classes.push('is-expanded')

  return (
    <article
      className={classes.join(' ')}
      onClick={canShowLeaders ? toggleLeaders : undefined}
      onKeyDown={
        canShowLeaders
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggleLeaders()
              }
            }
          : undefined
      }
      role={canShowLeaders ? 'button' : undefined}
      tabIndex={canShowLeaders ? 0 : undefined}
      aria-expanded={canShowLeaders ? expanded : undefined}
    >
      <header className="game-card__head">
        <span className={`pill pill--${game.status.state}`}>
          {game.status.state === 'in' && <span className="live-dot" aria-hidden="true" />}
          {statusLabel(game.status)}
        </span>
        <span className="game-card__when">
          {showDate && `${formatShortDate(game.date)} · `}
          {formatTime(game.date)}
        </span>
      </header>

      <ul className="game-card__teams">
        {game.competitors.map((team) => {
          const teamClasses = ['game-card__team']
          if (team.winner) teamClasses.push('is-winner')
          if (team.id === favoriteTeamId) teamClasses.push('is-favorite')

          return (
            <li key={team.id} className={teamClasses.join(' ')}>
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

      {canShowLeaders && (
        <div className="game-card__leaders-toggle">
          {expanded ? 'Ocultar destaques' : 'Ver melhores pontuadores'}
        </div>
      )}

      {expanded && (
        <div className="game-card__leaders">
          {loadingLeaders && <p className="muted">A carregar destaques...</p>}
          {leadersError && <p className="feedback--inline-error">{leadersError}</p>}
          {!loadingLeaders && !leadersError && leaders && (
            <div className="leaders-grid">
              {leaders.map((team) => (
                <div key={team.teamId} className="leaders-team">
                  <p className="leaders-team__name">
                    {team.logo && <img src={team.logo} alt="" width="18" height="18" />}
                    {team.abbreviation || team.teamName}
                  </p>
                  <ul className="leaders-list">
                    {team.players.map((player) => (
                      <li key={player.id || player.name} className="leader-row">
                        {player.headshot ? (
                          <img src={player.headshot} alt="" width="28" height="28" loading="lazy" />
                        ) : (
                          <span className="leader-row__avatar" aria-hidden="true" />
                        )}
                        <span className="leader-row__info">
                          <strong>{player.shortName || player.name}</strong>
                          <span>
                            {player.points} PTS
                            {player.rebounds ? ` · ${player.rebounds} REB` : ''}
                            {player.assists ? ` · ${player.assists} AST` : ''}
                          </span>
                        </span>
                      </li>
                    ))}
                    {team.players.length === 0 && <li className="muted">Sem dados</li>}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
