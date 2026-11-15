function BasketballMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
      <path d="M5.2 5.2c2.7 1.7 4.3 4.3 4.3 6.8s-1.6 5.1-4.3 6.8" />
      <path d="M18.8 5.2c-2.7 1.7-4.3 4.3-4.3 6.8s1.6 5.1 4.3 6.8" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M10.3 20a2 2 0 0 0 3.4 0" />
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </svg>
  )
}

export default function Header({ team, onClearTeam, notifications }) {
  const { supported, permission, requestPermission } = notifications
  const enabled = permission === 'granted'
  const blocked = permission === 'denied'

  return (
    <header className={`site-header${team ? ' has-team' : ''}`}>
      <div className="brand">
        <span className="brand__mark">
          <BasketballMark />
        </span>
        <div className="brand__text">
          <strong>NaCesta</strong>
          <span>placar, agenda e classificação</span>
        </div>
      </div>

      <div className="header__actions">
        {supported && (
          <button
            type="button"
            className={`icon-button${enabled ? ' is-active' : ''}`}
            onClick={requestPermission}
            disabled={enabled || blocked}
            title={
              enabled
                ? 'Notificações ativas'
                : blocked
                  ? 'Notificações bloqueadas no navegador'
                  : 'Ativar notificações dos jogos do teu time'
            }
            aria-label={
              enabled
                ? 'Notificações ativas'
                : blocked
                  ? 'Notificações bloqueadas'
                  : 'Ativar notificações'
            }
          >
            <BellIcon />
          </button>
        )}

        {team && (
          <div className="header__team">
            {team.logo && <img src={team.logo} alt="" width="26" height="26" />}
            <span className="header__team-name">{team.abbreviation}</span>
            <button
              type="button"
              className="link-button"
              onClick={onClearTeam}
              aria-label="Trocar de time"
              title="Trocar de time"
            >
              <SwapIcon />
              <span>Trocar time</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
