export type ActivityType = 'red_carpet' | 'interview' | 'live' | 'work_release'

export type CommentType = 'fan' | 'passerby' | 'media'

export interface RadarDimension {
  name: string
  score: number
  previousScore: number
  changeReason: string
}

export interface KeywordItem {
  word: string
  count: number
  sentiment: 'positive' | 'neutral' | 'negative'
  dimension: string
}

export interface CommentSample {
  id: string
  content: string
  type: CommentType
  source: string
  likes: number
  time: string
}

export interface Activity {
  id: string
  title: string
  type: ActivityType
  date: string
  summary: string
  overallScore: number
  scoreChange: number
  radarData: RadarDimension[]
  keywords: KeywordItem[]
  totalComments: number
}

export interface ReviewItemType {
  id: string
  category: 'interview' | 'styling' | 'fan_communication' | 'other'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'done'
  relatedActivityId?: string
}

export interface ActivityTypeMeta {
  key: ActivityType
  label: string
}

export const ACTIVITY_TYPE_META: ActivityTypeMeta[] = [
  { key: 'red_carpet', label: '红毯' },
  { key: 'interview', label: '采访' },
  { key: 'live', label: '直播' },
  { key: 'work_release', label: '作品播出' }
]

export const REVIEW_CATEGORY_META = [
  { key: 'interview', label: '下次采访注意', color: '#4f6ef7', bgColor: '#eef1ff' },
  { key: 'styling', label: '造型沟通', color: '#ff7d9a', bgColor: '#ffeef2' },
  { key: 'fan_communication', label: '粉丝沟通', color: '#00b42a', bgColor: '#e8ffed' },
  { key: 'other', label: '其他事项', color: '#86909c', bgColor: '#f2f3f5' }
]

export const COMMENT_TYPE_META = [
  { key: 'fan', label: '粉丝控评', color: '#ff7d9a', bgColor: '#ffeef2' },
  { key: 'passerby', label: '路人反馈', color: '#86909c', bgColor: '#f2f3f5' },
  { key: 'media', label: '媒体评价', color: '#4f6ef7', bgColor: '#eef1ff' }
]
