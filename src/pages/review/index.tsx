import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore } from '@/store/useReputationStore'
import { REVIEW_CATEGORY_META } from '@/types/reputation'
import ReviewItem from '@/components/ReviewItem'

type CategoryKey = 'all' | 'interview' | 'styling' | 'fan_communication' | 'other'

const ReviewPage: React.FC = () => {
  const { reviewItems, toggleReviewStatus, setSelectedActivity } = useReputationStore()
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [showDone, setShowDone] = useState(true)

  const pendingItems = useMemo(
    () => reviewItems.filter(item => item.status === 'pending'),
    [reviewItems]
  )

  const doneItems = useMemo(
    () => reviewItems.filter(item => item.status === 'done'),
    [reviewItems]
  )

  const filteredPending = useMemo(() => {
    if (activeCategory === 'all') return pendingItems
    return pendingItems.filter(item => item.category === activeCategory)
  }, [pendingItems, activeCategory])

  const filteredDone = useMemo(() => {
    if (activeCategory === 'all') return doneItems
    return doneItems.filter(item => item.category === activeCategory)
  }, [doneItems, activeCategory])

  const handleToggle = (id: string) => {
    toggleReviewStatus(id)
    console.log('[ReviewPage] toggle item:', id)
  }

  const handleSourceClick = (activityId: string) => {
    setSelectedActivity(activityId)
    Taro.switchTab({ url: '/pages/cloudmap/index' })
    console.log('[ReviewPage] navigate to activity cloudmap:', activityId)
  }

  const handleRefresh = () => {
    console.log('[ReviewPage] pull down refresh')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 800)
  }

  React.useEffect(() => {
    const pullDown = Taro.onPullDownRefresh(handleRefresh)
    return () => {
      pullDown.offPullDownRefresh?.(handleRefresh)
    }
  }, [])

  const categories = [
    { key: 'all' as const, label: '全部' },
    ...REVIEW_CATEGORY_META.map(m => ({ key: m.key, label: m.label }))
  ]

  const pendingCount = activeCategory === 'all'
    ? pendingItems.length
    : pendingItems.filter(i => i.category === activeCategory).length

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>复盘清单</Text>
        <Text className={styles.subtitle}>把可改进事项分类整理，持续优化</Text>

        <View className={styles.statsBar}>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{pendingItems.length}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{doneItems.length}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>
              {reviewItems.length > 0 ? Math.round((doneItems.length / reviewItems.length) * 100) : 0}%
            </Text>
            <Text className={styles.statLabel}>完成率</Text>
          </View>
        </View>
      </View>

      <ScrollView
        scrollX
        className={styles.categoryTabs}
        showScrollbar={false}
      >
        {categories.map(cat => (
          <View
            key={cat.key}
            className={classnames(
              styles.categoryTab,
              activeCategory === cat.key && styles.active
            )}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Text className={styles.categoryTabText}>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        scrollY
        showScrollbar={false}
      >
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>待处理</Text>
          <Text className={styles.sectionCount}>{pendingCount} 项</Text>
        </View>

        {filteredPending.length > 0 ? (
          <View className={styles.list}>
            {filteredPending.map(item => (
              <ReviewItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
                showSource={true}
                onSourceClick={handleSourceClick}
              />
            ))}
          </View>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyText}>
              {activeCategory === 'all' ? '太棒了，没有待处理事项 🎉' : '该分类暂无待处理事项'}
            </Text>
          </View>
        )}

        {showDone && filteredDone.length > 0 && (
          <View className={styles.doneSection}>
            <View className={styles.doneHeader}>
              <Text className={styles.doneTitle}>已完成 ({filteredDone.length})</Text>
              <Text
                className={styles.doneToggle}
                onClick={() => setShowDone(false)}
              >
                收起
              </Text>
            </View>
            <View className={styles.list}>
              {filteredDone.map(item => (
                <ReviewItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  showSource={true}
                  onSourceClick={handleSourceClick}
                />
              ))}
            </View>
          </View>
        )}

        {!showDone && filteredDone.length > 0 && (
          <View className={styles.showDoneBtn} onClick={() => setShowDone(true)}>
            <Text className={styles.showDoneText}>展开已完成 ({filteredDone.length})</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default ReviewPage
