const API_BASE = (import.meta.env?.VITE_ESPN_BASE ?? '/api/espn').replace(/\/$/, '')
const SITE = `${API_BASE}/apis/site/v2/sports/basketball/nba`
const CORE = `${API_BASE}/apis/v2/sports/basketball/nba`

const CONFERENCE_LABEL = { East: 'Leste', West: 'Oeste' }

async function getJSON(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`A ESPN respondeu ${response.status}. Tenta novamente em instantes.`)
  }
  return response.json()
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return [value]
  return []
}

function firstLogo(team) {
  const logos = team?.logos ?? []
  return (
    logos.find((logo) => logo.rel?.includes('default'))?.href ??
    logos.find((logo) => logo.rel?.includes('scoreboard'))?.href ??
    logos[0]?.href ??
    team?.logo ??
    null
  )
}

function findStat(stats, name) {
  return stats?.find((stat) => stat.name === name)
}

function toScore(score) {
  if (score == null || score === '') return null
  if (typeof score === 'object') {
    if (score.value != null) return Number(score.value)
    if (score.displayValue) return Number(score.displayValue)
    return null
  }
  const parsed = Number(score)
  return Number.isNaN(parsed) ? null : parsed
}

function normalizeStatus(raw) {
  const type = raw?.type ?? {}
  return {
    state: type.state ?? 'pre',
    detail: type.detail ?? '',
    shortDetail: type.shortDetail ?? '',
    completed: Boolean(type.completed),
    clock: raw?.displayClock ?? '',
    period: raw?.period ?? null,
  }
}

function normalizeGame(event) {
  const competition = toArray(event.competitions)[0] ?? {}
  const competitors = (competition.competitors ?? []).map((competitor) => {
    const total = competitor.record?.find?.((item) => item.type === 'total')
    return {
      id: String(competitor.team?.id ?? competitor.id),
      abbreviation: competitor.team?.abbreviation ?? '',
      displayName: competitor.team?.displayName ?? '',
      shortName: competitor.team?.shortDisplayName ?? competitor.team?.name ?? '',
      logo: firstLogo(competitor.team),
      score: toScore(competitor.score),
      winner: Boolean(competitor.winner),
      homeAway: competitor.homeAway ?? '',
      record: competitor.records?.[0]?.summary ?? total?.displayValue ?? null,
    }
  })

  const broadcast = (competition.broadcasts ?? [])
    .map((item) => item.names ?? item.media?.shortName)
    .filter(Boolean)
    .join(', ')

  return {
    id: String(event.id),
    date: event.date,
    name: event.name,
    shortName: event.shortName,
    venue: competition.venue?.fullName ?? null,
    broadcast: broadcast || null,
    headline: competition.headlines?.[0]?.shortLinkText ?? null,
    status: normalizeStatus(event.status ?? competition.status),
    competitors,
  }
}

export function toDateParam(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export async function fetchTeams(signal) {
  const [teamsPayload, standingsPayload] = await Promise.all([
    getJSON(`${SITE}/teams`, signal),
    getJSON(`${CORE}/standings`, signal).catch(() => null),
  ])

  const conferenceByTeam = {}
  for (const group of standingsPayload?.children ?? []) {
    const label = CONFERENCE_LABEL[group.abbreviation] ?? group.name
    for (const entry of group?.standings?.entries ?? []) {
      conferenceByTeam[String(entry.team.id)] = label
    }
  }

  const rawTeams = teamsPayload?.sports?.[0]?.leagues?.[0]?.teams ?? []

  return rawTeams
    .map(({ team }) => ({
      id: String(team.id),
      abbreviation: team.abbreviation,
      displayName: team.displayName,
      shortName: team.shortDisplayName ?? team.name,
      color: `#${team.color ?? '1d1d1f'}`,
      logo: firstLogo(team),
      conference: conferenceByTeam[team.id] ?? null,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export async function fetchStandings(signal) {
  const payload = await getJSON(`${CORE}/standings`, signal)

  return (payload?.children ?? [])
    .map((group) => {
      const teams = (group?.standings?.entries ?? [])
        .map((entry) => {
          const stats = entry.stats ?? []
          const wins = findStat(stats, 'wins')?.value ?? 0
          const losses = findStat(stats, 'losses')?.value ?? 0
          const total = stats.find((stat) => stat.type === 'total')

          return {
            id: String(entry.team.id),
            abbreviation: entry.team.abbreviation,
            displayName: entry.team.displayName,
            shortName: entry.team.shortDisplayName ?? entry.team.name,
            logo: firstLogo(entry.team),
            wins,
            losses,
            pct: findStat(stats, 'winPercent')?.value ?? 0,
            gamesBehind: findStat(stats, 'gamesBehind')?.displayValue ?? null,
            streak: findStat(stats, 'streak')?.displayValue ?? null,
            diff: findStat(stats, 'differential')?.displayValue ?? null,
            record: total?.summary ?? `${wins}-${losses}`,
          }
        })
        .sort((a, b) => b.pct - a.pct || b.wins - a.wins)

      teams.forEach((team, index) => {
        team.seed = index + 1
      })

      return {
        id: String(group.id),
        name: CONFERENCE_LABEL[group.abbreviation] ?? group.name,
        shortName: group.abbreviation,
        season: group?.standings?.seasonDisplayName ?? payload?.season?.displayName ?? '',
        teams,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchScoreboard(date, signal) {
  const payload = await getJSON(`${SITE}/scoreboard?dates=${toDateParam(date)}`, signal)

  return (payload?.events ?? [])
    .map((event) => normalizeGame(event))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export async function fetchTeamSchedule(teamId, signal) {
  const payload = await getJSON(`${SITE}/teams/${teamId}/schedule`, signal)

  return (payload?.events ?? [])
    .map((event) => normalizeGame(event))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}
