export type PayloadType = {
  type: 'connected' | 'disconnected' | 'message'
  uuid: string
  clientId: string
  userName: string
  message: string
  timestamp: string
}