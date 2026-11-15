import { useEffect, useMemo, useState } from 'react'
import AlertStrip from './components/AlertStrip'
import Header from './components/Header'
import Onboarding from './components/Onboarding'
import ScoreboardPanel from './components/ScoreboardPanel'
import StandingsPanel from './components/StandingsPanel'
import TeamHero from './components/TeamHero'
import TeamPanel from './components/TeamPanel'
import { fetchScoreboard, fetchStandings, fetchTeamSchedule, fetchTeams } from './api/espn'
import { useAsync } from './hooks/useAsync'
import { useEmailAlerts } from './hooks/useEmailAlerts'
import { useFavoriteTeam } from './hooks/useFavoriteTeam'
import { useNotifications } from './hooks/useNotifications'
import { formatCountdown, formatTime, startOfDay } from './lib/format'
import { findStanding, isLive, liveGameFor, nextGameFor, splitGame } from './lib/games'
import './App.css'

const TABS = [
  { id: 'jogos', label: 'Jogos' },
  { id: 'time', label: 'Meu time' },
  { id: 'classificacao', label: 'Classificação' },
]

export default function App() {
  const { team, selectTeam, clearTeam } = useFavoriteTeam()
  const [tab, setTab] = useState('jogos')
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [now, setNow] = useState(() => Date.now())
  const minute = Math.floor(now / 60_000)

  const teams = useAsync((signal) => fetchTeams(signal), [])
  const standings = useAsync((signal) => fetchStandings(signal), [minute])
  const scoreboard = useAsync(
    (signal) => fetchScoreboard(selectedDate, signal),
    [selectedDate, now],
  )
  const schedule = useAsync(
    (signal) => (team ? fetchTeamSchedule(team.id, signal) : Promise.resolve([])),
    [team?.id, now],
  )

  const notifications = useNotifications()
  const { notify } = notifications
  const { enabled: emailEnabled, email } = useEmailAlerts()

  const games = useMemo(() => schedule.data ?? [], [schedule.data])
  const liveGame = useMemo(() => {
    const fromScoreboard = (scoreboard.data ?? []).find(
      (game) => isLive(game) && game.competitors.some((competitor) => competitor.id === team?.id),
    )
    return fromScoreboard ?? liveGameFor(games)
  }, [scoreboard.data, games, team?.id])
  const nextGame = useMemo(() => nextGameFor(games, now), [games, now])

  const hasLiveGames = useMemo(
    () => Boolean(liveGame) || (scoreboard.data ?? []).some((game) => isLive(game)),
    [liveGame, scoreboard.data],
  )

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(Date.now()),
      hasLiveGames ? 15_000 : 60_000,
    )
    return () => window.clearInterval(interval)
  }, [hasLiveGames])

  useEffect(() => {
    if (!team) return

    if (liveGame) {
      const { mine, opponent } = splitGame(liveGame, team.id)
      const subject = `A jogar agora: ${team.shortName}`
      const body = `${mine?.abbreviation} ${mine?.score ?? 0} — ${opponent?.score ?? 0} ${opponent?.abbreviation} · ${liveGame.status.shortDetail}`
      notify(`live:${liveGame.id}`, subject, body)
      email(`live:${liveGame.id}`, subject, body)
    }

    if (nextGame) {
      const diff = new Date(nextGame.date).getTime() - Date.now()
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        const { mine, opponent } = splitGame(nextGame, team.id)
        const subject = `Jogo de ${team.shortName} ${formatCountdown(nextGame.date)}`
        const body = `${mine?.abbreviation} vs ${opponent?.abbreviation} · ${formatTime(nextGame.date)}`
        notify(`next:${nextGame.id}`, subject, body)
        email(`next:${nextGame.id}`, subject, body)
      }
    }
  }, [team, liveGame, nextGame, notify, email])

  const favoriteStanding = findStanding(standings.data, team?.id)

  function handleSelectTeam(selectedTeam) {
    selectTeam(selectedTeam)
    setTab('time')
  }

  function handleClearTeam() {
    clearTeam()
    setTab('jogos')
  }

  return (
    <div className="app">
      <Header team={team} onClearTeam={handleClearTeam} notifications={notifications} />

      <main className="app__main">
        {!team ? (
          <Onboarding state={teams} onSelect={handleSelectTeam} />
        ) : (
          <>
            <TeamHero
              team={team}
              standing={favoriteStanding}
              nextGame={nextGame}
              liveGame={liveGame}
            />

            <AlertStrip notifications={notifications} />

            <nav className="tabs" aria-label="Secções do app">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? 'is-active' : undefined}
                  aria-current={tab === item.id ? 'page' : undefined}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {tab === 'jogos' && (
              <ScoreboardPanel
                state={scoreboard}
                date={selectedDate}
                onChangeDate={(nextDate) => setSelectedDate(startOfDay(nextDate))}
                favoriteTeamId={team.id}
              />
            )}

            {tab === 'time' && (
              <TeamPanel state={schedule} team={team} standing={favoriteStanding} />
            )}

            {tab === 'classificacao' && (
              <StandingsPanel state={standings} favoriteTeamId={team.id} />
            )}
          </>
        )}
      </main>

      <footer className="app__footer">
        <span>NaCesta · dados públicos da ESPN</span>
        <span>Projeto não afiliado à NBA ou à ESPN.</span>
      </footer>
    </div>
  )
}
