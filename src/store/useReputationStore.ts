import { create } from 'zustand'
import { Activity, ReviewItemType, CommentType } from '@/types/reputation'
import { mockActivities, mockReviewItems } from '@/data/mockData'

interface ReputationState {
  activities: Activity[]
  reviewItems: ReviewItemType[]
  selectedActivityId: string
  activeCommentType: CommentType | 'all'
  setSelectedActivity: (id: string) => void
  setActiveCommentType: (type: CommentType | 'all') => void
  toggleReviewStatus: (id: string) => void
  getSelectedActivity: () => Activity | undefined
}

export const useReputationStore = create<ReputationState>((set, get) => ({
  activities: mockActivities,
  reviewItems: mockReviewItems,
  selectedActivityId: mockActivities[0]?.id || '',
  activeCommentType: 'all',

  setSelectedActivity: (id: string) => {
    set({ selectedActivityId: id })
    console.log('[ReputationStore] selected activity:', id)
  },

  setActiveCommentType: (type: CommentType | 'all') => {
    set({ activeCommentType: type })
  },

  toggleReviewStatus: (id: string) => {
    set(state => ({
      reviewItems: state.reviewItems.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'pending' ? 'done' : 'pending' }
          : item
      )
    }))
    console.log('[ReputationStore] toggle review status:', id)
  },

  getSelectedActivity: () => {
    const state = get()
    return state.activities.find(a => a.id === state.selectedActivityId)
  }
}))
