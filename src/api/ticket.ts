import http from '@/utils/request'
import type { PageResult } from '@/types'

export interface TicketItem {
  id: number
  ticket_no: string
  user_id: number
  nickname: string
  phone: string
  category: string
  title: string
  content: string
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  assignee: string
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: number
  ticket_id: number
  sender: string
  content: string
  created_at: string
}

export function getTicketList(params: Record<string, unknown>): Promise<PageResult<TicketItem>> {
  return http.get<PageResult<TicketItem>>('/tickets', params)
}

export function getTicketDetail(id: number): Promise<TicketItem> {
  return http.get<TicketItem>(`/tickets/${id}`)
}

export function getTicketMessages(id: number): Promise<TicketMessage[]> {
  return http.get<TicketMessage[]>(`/tickets/${id}/messages`)
}

export function acceptTicket(id: number): Promise<null> {
  return http.post<null>(`/tickets/${id}/accept`)
}

export function replyTicket(id: number, content: string): Promise<null> {
  return http.post<null>(`/tickets/${id}/reply`, { content })
}

export function transferTicket(id: number, assignee: string): Promise<null> {
  return http.post<null>(`/tickets/${id}/transfer`, { assignee })
}

export function closeTicket(id: number): Promise<null> {
  return http.post<null>(`/tickets/${id}/close`)
}
