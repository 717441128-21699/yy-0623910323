import { create } from 'zustand'
import { Activity, ReviewItemType, CommentType } from '@/types/reputation'
import { mockActivities, mockReviewItems } from '@/data/mockData'

export type TimeRange = 'all' | '7days' | '30days'

interface ReputationState {
  activities: Activity[]
  reviewItems: ReviewItemType[]
  selectedActivityId: string | null
  activeCommentType: CommentType | 'all'
  searchKeyword: string
  timeRange: TimeRange
  compareMode: boolean
  setSelectedActivity: (id: string) => void
  setActiveCommentType: (type: CommentType | 'all') => void
  toggleReviewStatus: (id: string) => void
  getSelectedActivity: () => Activity | undefined
  setSearchKeyword: (keyword: string) => void
  setTimeRange: (range: TimeRange) => void
  setCompareMode: (enabled: boolean) => void
  getFilteredActivities: () => Activity[]
  resetFilters: () => void
}

export const useReputationStore = create<ReputationState>((set, get) => ({
  activities: mockActivities,
  reviewItems: mockReviewItems,
  selectedActivityId: mockActivities[0]?.id || null,
  activeCommentType: 'all',
  searchKeyword: '',
  timeRange: 'all',
  compareMode: false,

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
    if (!state.selectedActivityId) return undefined
    return state.activities.find(a => a.id === state.selectedActivityId)
  },

  setSearchKeyword: (keyword: string) => {
    set({ searchKeyword: keyword })
    const filtered = get().getFilteredActivities()
    if (filtered.length > 0) {
      const currentValid = filtered.find(a => a.id === get().selectedActivityId)
      if (!currentValid) {
        set({ selectedActivityId: filtered[0].id })
        console.log('[ReputationStore] auto switch to first filtered:', filtered[0].id)
      }
    } else {
      set({ selectedActivityId: null })
      console.log('[ReputationStore] no filtered results, clear selection')
    }
    console.log('[ReputationStore] search keyword:', keyword)
  },

  setTimeRange: (range: TimeRange) => {
    set({ timeRange: range })
    const filtered = get().getFilteredActivities()
    if (filtered.length > 0) {
      const currentValid = filtered.find(a => a.id === get().selectedActivityId)
      if (!currentValid) {
        set({ selectedActivityId: filtered[0].id })
        console.log('[ReputationStore] auto switch to first filtered:', filtered[0].id)
      }
    } else {
      set({ selectedActivityId: null })
      console.log('[ReputationStore] no filtered results, clear selection')
    }
    console.log('[ReputationStore] time range:', range)
  },

  setCompareMode: (enabled: boolean) => {
    set({ compareMode: enabled })
    console.log('[ReputationStore] compare mode:', enabled)
  },

  resetFilters: () => {
    set({
      searchKeyword: '',
      timeRange: 'all',
      selectedActivityId: mockActivities[0]?.id || null
    })
    console.log('[ReputationStore] filters reset')
  },

  getFilteredActivities: () => {
    const state = get()
    let result = [...state.activities]

    if (state.searchKeyword.trim()) {
      const kw = state.searchKeyword.trim().toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(kw) ||
        a.summary.toLowerCase().includes(kw)
      )
    }

    if (state.timeRange !== 'all') {
      const now = new Date('2024-06-19')
      const days = state.timeRange === '7days' ? 7 : 30
      result = result.filter(a => {
        const diff = (now.getTime() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24)
        return diff <= days
      })
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}))
