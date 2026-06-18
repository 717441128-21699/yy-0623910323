import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore } from '@/store/useReputationStore'
import { getActivityTypeLabel, getChangeText, formatDate } from '@/utils'
import { ActivityType } from '@/types/reputation'

const TypeTrendPage: React.FC = () => {
  const router = useRouter()
  const type = (router.params.type || 'red_carpet') as ActivityType
  const { activities, reviewItems, setSelectedActivity } = useReputationStore()

  const typeActivities = useMemo(() => {
    return activities
      .filter(a => a.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [activities, type])

  const stats = useMemo(() => {
    const count = typeActivities.length
    const avgScore = count > 0
      ? Math.round(typeActivities.reduce((sum, a) => sum + a.overallScore, 0) / count)
      : 0
    const latestScore = count > 0 ? typeActivities[0].overallScore : 0
    const earliestScore = count > 0 ? typeActivities[count - 1].overallScore : 0
    const trend = count >= 2 ? latestScore - earliestScore : 0

    const typeActivityIds = new Set(typeActivities.map(a => a.id))
    const typeReviews = reviewItems.filter(r => r.relatedActivityId && typeActivityIds.has(r.relatedActivityId))
    const reviewTotal = typeReviews.length
    const reviewDone = typeReviews.filter(r => r.status === 'done').length
    const reviewRate = reviewTotal > 0 ? Math.round((reviewDone / reviewTotal) * 100) : 0

    return {
      count,
      avgScore,
      latestScore,
      earliestScore,
      trend,
      reviewTotal,
      reviewDone,
      reviewRate
    }
  }, [typeActivities, reviewItems])

  const getActivityReviewStats = (activityId: string) => {
    const actReviews = reviewItems.filter(r => r.relatedActivityId === activityId)
    const total = actReviews.length
    const done = actReviews.filter(r => r.status === 'done').length
    const rate = total > 0 ? Math.round((done / total) * 100) : 0
    const highPriorityPending = actReviews.filter(r => r.status === 'pending' && r.priority === 'high').length
    return { total, done, rate, highPriorityPending }
  }

  const getActivityChange = (activity: typeof typeActivities[0], index: number): number | null => {
    if (index >= typeActivities.length - 1) return null
    const prev = typeActivities[index + 1]
    return activity.overallScore - prev.overallScore
  }

  const isBelowAverage = (score: number) => stats.count >= 2 && score < stats.avgScore

  const handleActivityClick = (id: string) => {
    setSelectedActivity(id)
    Taro.switchTab({ url: '/pages/cloudmap/index' })
    console.log('[TypeTrendPage] navigate to activity:', id)
  }

  const getTrendClass = (trend: number) => {
    if (trend > 0) return 'up'
    if (trend < 0) return 'down'
    return 'flat'
  }

  const typeLabel = getActivityTypeLabel(type)

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerLabel}>{typeLabel}趋势</Text>
        <Text className={styles.headerDesc}>同类活动历史口碑与复盘进度</Text>

        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.count}</Text>
            <Text className={styles.statLabel}>活动次数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.avgScore}</Text>
            <Text className={styles.statLabel}>平均分</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statNum, getTrendClass(stats.trend))}>
              {getChangeText(stats.trend)}
            </Text>
            <Text className={styles.statLabel}>整体趋势</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNum} style={{ color: '#00b42a' }}>{stats.reviewRate}%</Text>
            <Text className={styles.statLabel}>复盘完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>活动时间线</Text>
        <Text className={styles.sectionTip}>点击查看活动详情</Text>
      </View>

      {typeActivities.length > 0 ? (
        <ScrollView scrollY showScrollbar={false}>
          <View className={styles.timeline}>
            {typeActivities.map((activity, index) => {
              const change = getActivityChange(activity, index)
              const reviewStats = getActivityReviewStats(activity.id)
              const belowAvg = isBelowAverage(activity.overallScore)
              const isLatest = index === 0

              return (
                <View key={activity.id} className={styles.timelineItem}>
                  <View className={styles.timelineDot}>
                    {isLatest && <View className={styles.timelineDotInner}></View>}
                  </View>
                  <View className={styles.timelineLine}></View>

                  <View
                    className={classnames(
                      styles.timelineCard,
                      belowAvg && styles.belowAvg,
                      isLatest && styles.latest
                    )}
                    onClick={() => handleActivityClick(activity.id)}
                  >
                    <View className={styles.cardHeader}>
                      <Text className={styles.cardDate}>{formatDate(activity.date)}</Text>
                      {isLatest && (
                        <View className={styles.cardTag}>
                          <Text className={styles.cardTagText}>最新</Text>
                        </View>
                      )}
                      {belowAvg && (
                        <View className={classnames(styles.cardTag, styles.warningTag)}>
                          <Text className={styles.cardTagText}>拖后腿</Text>
                        </View>
                      )}
                    </View>

                    <Text className={styles.cardTitle}>{activity.title}</Text>

                    <View className={styles.cardScoreRow}>
                      <View className={styles.cardScoreWrap}>
                        <Text className={styles.cardScore}>{activity.overallScore}</Text>
                        <Text className={styles.cardScoreLabel}>综合分</Text>
                      </View>
                      {change !== null && (
                        <View className={styles.cardChangeWrap}>
                          <Text className={classnames(styles.cardChange, getTrendClass(change))}>
                            {getChangeText(change)}
                          </Text>
                          <Text className={styles.cardChangeLabel}>vs 上一次</Text>
                        </View>
                      )}
                    </View>

                    {reviewStats.total > 0 && (
                      <View className={styles.cardReview}>
                        <View className={styles.cardReviewHeader}>
                          <Text className={styles.cardReviewLabel}>复盘进度</Text>
                          <Text className={styles.cardReviewRate}>{reviewStats.rate}%</Text>
                        </View>
                        <View className={styles.cardReviewBar}>
                          <View
                            className={styles.cardReviewFill}
                            style={{ width: `${reviewStats.rate}%` }}
                          ></View>
                        </View>
                        <View className={styles.cardReviewFooter}>
                          <Text className={styles.cardReviewCount}>
                            {reviewStats.done}/{reviewStats.total} 项已完成
                          </Text>
                          {reviewStats.highPriorityPending > 0 && (
                            <Text className={styles.cardReviewHigh}>
                              ⚡ {reviewStats.highPriorityPending} 项高优待办
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyEmoji}>📊</Text>
          <Text className={styles.emptyTitle}>暂无{typeLabel}活动</Text>
          <Text className={styles.emptyDesc}>该类型活动数据还在积累中</Text>
        </View>
      )}
    </View>
  )
}

export default TypeTrendPage
