import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore } from '@/store/useReputationStore'
import { ActivityType, ACTIVITY_TYPE_META } from '@/types/reputation'
import ActivityCard from '@/components/ActivityCard'

const ActivityPage: React.FC = () => {
  const { activities, selectedActivityId } = useReputationStore()
  const [activeFilter, setActiveFilter] = useState<ActivityType | 'all'>('all')

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') return activities
    return activities.filter(item => item.type === activeFilter)
  }, [activities, activeFilter])

  const handleFilterChange = (type: ActivityType | 'all') => {
    setActiveFilter(type)
    console.log('[ActivityPage] filter changed:', type)
  }

  const handleRefresh = () => {
    console.log('[ActivityPage] pull down refresh')
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

  const filters = [
    { key: 'all' as const, label: '全部' },
    ...ACTIVITY_TYPE_META
  ]

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>近期活动概览</Text>
        <Text className={styles.title}>口碑反馈面板</Text>
      </View>

      <ScrollView
        scrollX
        className={styles.filterBar}
        showScrollbar={false}
      >
        {filters.map(item => (
          <View
            key={item.key}
            className={classnames(styles.filterItem, activeFilter === item.key && styles.active)}
            onClick={() => handleFilterChange(item.key)}
          >
            <Text className={styles.filterText}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>

      <Text className={styles.sectionTitle}>近期活动</Text>

      {filteredActivities.length > 0 ? (
        <View className={styles.activityList}>
          {filteredActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isSelected={activity.id === selectedActivityId}
            />
          ))}
        </View>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyText}>暂无相关活动</Text>
        </View>
      )}
    </View>
  )
}

export default ActivityPage
