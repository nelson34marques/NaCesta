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

function liveClock(status) {
  if (status?.shortDetail) return status.shortDetail
  const period = status?.period ? `${status.period}º` : ''
  return [status?.clock, period].filter(Boolean).join(' · ') || 'Ao vivo'
}

export default function TeamHero({ team, standing, nextGame, liveGame }) {
  const featured = liveGame ?? nextGame
  const { mine, opponent } = featured ? splitGame(featured, team.id) : { mine: null, opponent: null }
  const isLiveGame = Boolean(liveGame)

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

      <div className={`team-hero__next${isLiveGame ? ' team-hero__next--live' : ''}`}>
        <p className={`eyebrow${isLiveGame ? ' eyebrow--live' : ''}`}>
          {isLiveGame && <span className="live-dot" aria-hidden="true" />}
          {isLiveGame ? 'A jogar agora' : 'Próximo jogo'}
        </p>
        {featured ? (
          <>
            <p className="team-hero__next-line">
              {isLiveGame ? (
                <>
                  <span>{mine?.abbreviation ?? team.abbreviation}</span>
                  <strong
                    className={`team-hero__score${
                      (mine?.score ?? 0) > (opponent?.score ?? 0)
                        ? ' is-leading'
                        : (mine?.score ?? 0) < (opponent?.score ?? 0)
                          ? ' is-trailing'
                          : ''
                    }`}
                  >
                    {mine?.score ?? 0}
                  </strong>
                  <span className="muted team-hero__dash">—</span>
                  <strong
                    className={`team-hero__score${
                      (opponent?.score ?? 0) > (mine?.score ?? 0)
                        ? ' is-leading'
                        : (opponent?.score ?? 0) < (mine?.score ?? 0)
                          ? ' is-trailing'
                          : ''
                    }`}
                  >
                    {opponent?.score ?? 0}
                  </strong>
                  <span>{opponent?.abbreviation ?? '—'}</span>
                </>
              ) : (
                <>
                  {team.abbreviation} <span className="muted">vs</span> {opponent?.abbreviation ?? '—'}
                </>
              )}
            </p>
            {isLiveGame ? (
              <p className="countdown countdown--live">{liveClock(featured.status)}</p>
            ) : (
              <>
                <p className="muted team-hero__next-time">
                  {formatShortDate(featured.date)} · {formatTime(featured.date)}
                </p>
                <p className="countdown">{formatCountdown(featured.date)}</p>
              </>
            )}
          </>
        ) : (
          <p className="muted">Sem jogos agendados.</p>
        )}
      </div>
    </section>
  )
}
