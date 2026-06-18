import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore, TimeRange } from '@/store/useReputationStore'
import { ActivityType, ACTIVITY_TYPE_META } from '@/types/reputation'
import { getChangeText } from '@/utils'
import ActivityCard from '@/components/ActivityCard'

const ActivityPage: React.FC = () => {
  const {
    selectedActivityId,
    activities,
    reviewItems,
    getFilteredActivities,
    setSearchKeyword,
    setTimeRange,
    setSelectedActivity,
    searchKeyword,
    timeRange,
    resetFilters
  } = useReputationStore()
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

  const typeTrendStats = useMemo(() => {
    return ACTIVITY_TYPE_META.map(meta => {
      const typeActivities = activities
        .filter(a => a.type === meta.key)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const count = typeActivities.length
      const avgScore = count > 0
        ? Math.round(typeActivities.reduce((sum, a) => sum + a.overallScore, 0) / count)
        : 0
      const latestScore = count > 0 ? typeActivities[typeActivities.length - 1].overallScore : 0
      const earliestScore = count > 0 ? typeActivities[0].overallScore : 0
      const trend = count >= 2 ? latestScore - earliestScore : 0

      const typeReviewIds = new Set(
        reviewItems.filter(r => {
          if (!r.relatedActivityId) return false
          const act = activities.find(a => a.id === r.relatedActivityId)
          return act?.type === meta.key
        }).map(r => r.id)
      )
      const typeReviews = reviewItems.filter(r => typeReviewIds.has(r.id))
      const reviewTotal = typeReviews.length
      const reviewDone = typeReviews.filter(r => r.status === 'done').length
      const reviewRate = reviewTotal > 0 ? Math.round((reviewDone / reviewTotal) * 100) : 0

      const latestId = count > 0 ? typeActivities[typeActivities.length - 1].id : ''

      return {
        type: meta.key,
        label: meta.label,
        count,
        avgScore,
        latestScore,
        earliestScore,
        trend,
        reviewTotal,
        reviewDone,
        reviewRate,
        latestId
      }
    })
  }, [activities, reviewItems])

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

  const handleTypeCardClick = (type: ActivityType) => {
    Taro.navigateTo({
      url: `/pages/type-trend/index?type=${type}`
    })
    console.log('[ActivityPage] type trend card clicked:', type)
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

  const getTrendClass = (trend: number) => {
    if (trend > 0) return 'up'
    if (trend < 0) return 'down'
    return 'flat'
  }

  return (
    <ScrollView
      scrollY
      className={styles.page}
      showScrollbar={false}
    >
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
        <View className={styles.emptyBox}>
          <Text className={styles.emptyEmoji}>{searchActive ? '🔍' : '📋'}</Text>
          <Text className={styles.emptyTitle}>
            {searchActive ? '未找到匹配的活动' : '暂无相关活动'}
          </Text>
          <Text className={styles.emptyDesc}>
            {searchActive ? '请尝试调整搜索关键词或时间范围' : '该分类下暂无活动'}
          </Text>
          {searchActive && (
            <View className={styles.emptyBtn} onClick={resetFilters}>
              <Text className={styles.emptyBtnText}>查看全部活动</Text>
            </View>
          )}
        </View>
      )}

      <Text className={styles.sectionTitle} style={{ marginTop: '24rpx' }}>
        📊 按活动类型看趋势
      </Text>
      <Text className={styles.sectionTip}>点击卡片可查看该类最新活动详情</Text>

      <View className={styles.trendGrid}>
        {typeTrendStats.map(item => {
          const trendClass = getTrendClass(item.trend)
          return (
            <View
              key={item.type}
              className={classnames(
                styles.trendCard,
                item.count === 0 && styles.emptyCard
              )}
              onClick={() => item.count > 0 && handleTypeCardClick(item.type)}
            >
              <View className={styles.trendCardHeader}>
                <Text className={styles.trendCardLabel}>{item.label}</Text>
                <Text className={styles.trendCardCount}>
                  {item.count} 次
                </Text>
              </View>
              {item.count > 0 ? (
                <>
                  <View className={styles.trendCardScoreRow}>
                    <Text className={styles.trendCardScore}>{item.latestScore}</Text>
                    <Text className={classnames(styles.trendCardTrend, trendClass)}>
                      {getChangeText(item.trend)}
                    </Text>
                  </View>
                  <Text className={styles.trendCardTrendLabel}>
                    平均分 {item.avgScore} 分
                  </Text>
                  <View className={styles.trendCardDivider}></View>
                  <View className={styles.trendCardReviewRow}>
                    <View className={styles.trendCardReviewBar}>
                      <View
                        className={styles.trendCardReviewFill}
                        style={{ width: `${item.reviewRate}%` }}
                      ></View>
                    </View>
                    <Text className={styles.trendCardReviewRate}>{item.reviewRate}%</Text>
                  </View>
                  <Text className={styles.trendCardReviewLabel}>
                    复盘完成 {item.reviewDone}/{item.reviewTotal}
                  </Text>
                </>
              ) : (
                <View className={styles.trendCardEmpty}>
                  <Text className={styles.trendCardEmptyText}>暂无该类活动</Text>
                </View>
              )}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default ActivityPage
