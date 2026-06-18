import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore, TimeRange } from '@/store/useReputationStore'
import { ActivityType, ACTIVITY_TYPE_META } from '@/types/reputation'
import ActivityCard from '@/components/ActivityCard'

const ActivityPage: React.FC = () => {
  const { selectedActivityId, getFilteredActivities, setSearchKeyword, setTimeRange, searchKeyword, timeRange } = useReputationStore()
  const [activeFilter, setActiveFilter] = useState<ActivityType | 'all'>('all')
  const [localSearch, setLocalSearch] = useState(searchKeyword)

  useEffect(() => {
    setLocalSearch(searchKeyword)
  }, [searchKeyword])

  const allFiltered = useMemo(() => getFilteredActivities(), [getFilteredActivities])

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') return allFiltered
    return allFiltered.filter(item => item.type === activeFilter)
  }, [allFiltered, activeFilter])

  const handleSearchChange = (val: string) => {
    setLocalSearch(val)
  }

  const handleSearchConfirm = () => {
    setSearchKeyword(localSearch)
    console.log('[ActivityPage] search confirmed:', localSearch)
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    setSearchKeyword('')
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

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

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: '7days', label: '最近7天' },
    { key: '30days', label: '最近30天' },
    { key: 'all', label: '全部时间' }
  ]

  const searchActive = searchKeyword || timeRange !== 'all'

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>近期活动概览</Text>
        <Text className={styles.title}>口碑反馈面板</Text>

        <View className={styles.searchBar}>
          <View className={styles.searchIcon}>
            <Text>🔍</Text>
          </View>
          <Input
            className={styles.searchInput}
            placeholder='搜索活动名称...'
            placeholderClass={styles.placeholder}
            value={localSearch}
            onInput={e => handleSearchChange(e.detail.value)}
            onConfirm={handleSearchConfirm}
            confirmType='search'
          />
          {localSearch && (
            <Text className={styles.clearBtn} onClick={handleClearSearch}>✕</Text>
          )}
        </View>

        <View className={styles.timeRangeBar}>
          {timeRanges.map(range => (
            <View
              key={range.key}
              className={classnames(styles.timeRangeItem, timeRange === range.key && styles.active)}
              onClick={() => handleTimeRangeChange(range.key)}
            >
              <Text className={styles.timeRangeText}>{range.label}</Text>
            </View>
          ))}
        </View>
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

      {searchActive && (
        <Text className={styles.resultTip}>
          共找到 {allFiltered.length} 个匹配活动
        </Text>
      )}

      <Text className={styles.sectionTitle}>
        {activeFilter === 'all' ? '近期活动' : ACTIVITY_TYPE_META.find(m => m.key === activeFilter)?.label}
      </Text>

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
          <Text className={styles.emptyText}>
            {searchActive ? '没有找到匹配的活动，试试其他关键词' : '暂无相关活动'}
          </Text>
        </View>
      )}
    </View>
  )
}

export default ActivityPage
