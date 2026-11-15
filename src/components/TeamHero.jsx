import { formatCountdown, formatShortDate, formatTime } from '../lib/format'
import { splitGame } from '../lib/games'

export default function TeamHero({ team, standing, nextGame }) {
  const opponent = nextGame ? splitGame(nextGame, team.id).opponent : null

  return (
    <section className="team-hero" style={{ '--team-color': team.color }}>
      <div className="team-hero__identity">
        {team.logo && (
          <img src={team.logo} alt={`Logo dos ${team.displayName}`} width="84" height="84" />
        )}
        <div>
          <p className="eyebrow">
            {team.conference ? `Conferência ${team.conference}` : 'NBA'}
          </p>
          <h1>{team.displayName}</h1>
          <div className="team-hero__stats">
            <span>
              <strong>{standing?.record ?? '—'}</strong> registo
            </span>
            <span>
              <strong>{standing ? `${standing.seed}º` : '—'}</strong> na conferência
            </span>
            {standing?.streak && (
              <span>
                <strong>{standing.streak}</strong> sequência
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="team-hero__next">
        <p className="eyebrow">Próximo jogo</p>
        {nextGame ? (
          <>
            <p className="team-hero__next-line">
              {team.abbreviation} <span className="muted">vs</span> {opponent?.abbreviation ?? '—'}
            </p>
            <p className="muted">
              {formatShortDate(nextGame.date)} · {formatTime(nextGame.date)}
            </p>
            <p className="countdown">{formatCountdown(nextGame.date)}</p>
          </>
        ) : (
          <p className="muted">Sem jogos agendados.</p>
        )}
      </div>
    </section>
  )
}
