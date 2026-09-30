export interface Count {
  name: string
  count: number
}

export interface DayCount {
  date: string
  count: number
}

// One item of GET /api/analytics -> { allUrls }
export interface UrlListItem {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: string
  _count: { clicks: number }
}

// Response of GET /api/analytics/:shortCode
export interface UrlAnalytics {
  shortCode: string
  originalUrl: string
  createdAt: string
  totalClicks: number
  botClicks: number
  humanClicks: number
  clicksByDay: DayCount[]
  countries: Count[]
  cities: Count[]
  devices: Count[]
  browsers: Count[]
  os: Count[]
  referrers: Count[]
}
