const RECENT_WINDOW = 3 * 60 * 60 * 1000

export function splitGame(game, teamId) {
  const id = String(teamId)
  return {
    mine: game.competitors.find((team) => team.id === id) ?? null,
    opponent: game.competitors.find((team) => team.id !== id) ?? null,
  }
}

export function isLive(game) {
  return game.status.state === 'in'
}

export function isFinished(game) {
  return game.status.state === 'post' || game.status.completed
}

export function nextGameFor(games, now = Date.now()) {
  return (
    games
      .filter((game) => !isFinished(game) && new Date(game.date).getTime() > now - RECENT_WINDOW)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] ?? null
  )
}

export function liveGameFor(games) {
  return games.find((game) => isLive(game)) ?? null
}

export function upcomingGames(games, limit = 5, now = Date.now()) {
  return games
    .filter((game) => !isFinished(game) && new Date(game.date).getTime() > now)
    .slice(0, limit)
}

export function recentResults(games, limit = 5) {
  return games.filter(isFinished).slice(-limit).reverse()
}

export function findStanding(standings, teamId) {
  if (!standings || !teamId) return null
  for (const conference of standings) {
    const row = conference.teams.find((entry) => entry.id === String(teamId))
    if (row) return { ...row, conference: conference.name }
  }
  return null
}
