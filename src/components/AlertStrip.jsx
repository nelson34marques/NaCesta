import { splitGame } from '../lib/games'

export default function AlertStrip({ notifications }) {
  const { supported, permission, requestPermission } = notifications
  const needsPermission = supported && permission === 'default'

  if (!needsPermission) return null

  return (
    <section className="alerts">
      <button type="button" className="button button--accent" onClick={requestPermission}>
        Ativar notificações
      </button>
    </section>
  )
}
