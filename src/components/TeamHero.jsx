import { formatCountdown, formatShortDate, formatTime } from '../lib/format'
import { splitGame } from '../lib/games'

function Record({ value }) {
  if (!value || value === '—') return <strong>—</strong>
  const [wins, losses] = String(value).split('-')
  if (losses == null) return <strong>{value}</strong>
  return (
    <strong className="record">
      <span className="record__win">{wins}</span>
      <span className="record__sep">-</span>
      <span className="record__loss">{losses}</span>
    </strong>
  )
}

function Streak({ value }) {
  if (!value) return null
  const text = String(value)
  const tone = text.startsWith('W') ? 'win' : text.startsWith('L') ? 'loss' : 'neutral'
  return <strong className={`streak streak--${tone}`}>{text}</strong>
}

export default function TeamHero({ team, standing, nextGame, emailEnabled }) {
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
            <span className="team-hero__stat">
              <Record value={standing?.record ?? '—'} />
              <span className="team-hero__stat-label">registo</span>
            </span>
            <span className="team-hero__stat">
              <strong>{standing ? `${standing.seed}º` : '—'}</strong>
              <span className="team-hero__stat-label">conferência</span>
            </span>
            {standing?.streak && (
              <span className="team-hero__stat">
                <Streak value={standing.streak} />
                <span className="team-hero__stat-label">sequência</span>
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
            <p className="muted team-hero__next-time">
              {formatShortDate(nextGame.date)} · {formatTime(nextGame.date)}
            </p>
            <p className="countdown">{formatCountdown(nextGame.date)}</p>
            {emailEnabled && <span className="alerts__email">Alertas por email ativos</span>}
          </>
        ) : (
          <p className="muted">Sem jogos agendados.</p>
        )}
      </div>
    </section>
  )
}
