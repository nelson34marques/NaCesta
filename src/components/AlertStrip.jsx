import { splitGame } from '../lib/games'

export default function AlertStrip({ team, liveGame, notifications }) {
  const { supported, permission, requestPermission } = notifications

  let content = null

  if (liveGame) {
    const { mine, opponent } = splitGame(liveGame, team.id)
    content = (
      <div className="alert alert--live">
        <span className="alert__dot" aria-hidden="true" />
        <div className="alert__body">
          <strong>A jogar agora</strong>
          <p>
            {mine?.abbreviation} {mine?.score ?? 0} — {opponent?.score ?? 0}{' '}
            {opponent?.abbreviation}{' '}
            <span className="muted">· {liveGame.status.shortDetail}</span>
          </p>
        </div>
      </div>
    )
  }

  const needsPermission = supported && permission === 'default'

  if (!content && !needsPermission) return null

  return (
    <section className="alerts">
      {content}
      {needsPermission && (
        <button type="button" className="button button--accent" onClick={requestPermission}>
          Ativar notificações
        </button>
      )}
    </section>
  )
}
