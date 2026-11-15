import { formatCountdown, formatTime } from '../lib/format'
import { splitGame } from '../lib/games'

export default function AlertStrip({ team, liveGame, nextGame, notifications, emailEnabled }) {
  const { supported, permission, requestPermission } = notifications

  let content = null

  if (liveGame) {
    const { mine, opponent } = splitGame(liveGame, team.id)
    content = (
      <div className="alert alert--live">
        <span className="alert__dot" aria-hidden="true" />
        <div>
          <strong>A jogar agora</strong>
          <p>
            {mine?.abbreviation} {mine?.score ?? 0} — {opponent?.score ?? 0}{' '}
            {opponent?.abbreviation}{' '}
            <span className="muted">· {liveGame.status.shortDetail}</span>
          </p>
        </div>
      </div>
    )
  } else if (nextGame) {
    const { mine, opponent } = splitGame(nextGame, team.id)
    content = (
      <div className="alert">
        <div>
          <strong>Próximo jogo {formatCountdown(nextGame.date)}</strong>
          <p>
            {mine?.abbreviation} vs {opponent?.abbreviation} · {formatTime(nextGame.date)}
          </p>
        </div>
      </div>
    )
  }

  const needsPermission = supported && permission === 'default'

  if (!content && !needsPermission && !emailEnabled) return null

  return (
    <section className="alerts">
      {content}
      {needsPermission && (
        <button type="button" className="button button--accent" onClick={requestPermission}>
          Ativar notificações
        </button>
      )}
      {emailEnabled && <span className="alerts__email">Alertas por email ativos</span>}
    </section>
  )
}
