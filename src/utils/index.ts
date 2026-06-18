import { ActivityType, CommentType } from '@/types/reputation'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num)
}

export function getActivityTypeLabel(type: ActivityType): string {
  const map: Record<ActivityType, string> = {
    red_carpet: '红毯',
    interview: '采访',
    live: '直播',
    work_release: '作品播出'
  }
  return map[type] || type
}

export function getCommentTypeLabel(type: CommentType | 'all'): string {
  if (type === 'all') return '全部'
  const map: Record<CommentType, string> = {
    fan: '粉丝控评',
    passerby: '路人反馈',
    media: '媒体评价'
  }
  return map[type] || type
}

export function getChangeText(change: number): string {
  if (change > 0) return `+${change}`
  if (change < 0) return String(change)
  return '持平'
}

export function getChangeColor(change: number): string {
  if (change > 0) return '#00b42a'
  if (change < 0) return '#f53f3f'
  return '#86909c'
}

export function getSentimentColor(sentiment: 'positive' | 'neutral' | 'negative'): string {
  const map = {
    positive: '#00b42a',
    neutral: '#86909c',
    negative: '#f53f3f'
  }
  return map[sentiment]
}
