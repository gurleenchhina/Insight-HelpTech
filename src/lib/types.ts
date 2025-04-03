
export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  role: 'admin' | 'technician' | 'sales'
  photoUrl?: string
}

export interface VehicleData {
  deviceId: string
  deviceName: string
  groupName: string
  latitude: number
  longitude: number
  lastSeen: string
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  score: number
  rank: number
}
