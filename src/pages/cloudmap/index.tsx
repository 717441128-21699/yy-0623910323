import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore } from '@/store/useReputationStore'
import { getChangeText, getActivityTypeLabel } from '@/utils'
import { KeywordItem, CommentSample, Activity } from '@/types/reputation'
import RadarChart from '@/components/RadarChart'
import KeywordCloud from '@/components/KeywordCloud'
import CommentDrawer from '@/components/CommentDrawer'
import { getCommentsByKeyword, getPreviousSameTypeActivity, getReviewsByActivityId } from '@/data/mockData'

const CloudmapPage: React.FC = () => {
  const {
    activities,
    selectedActivityId,
    setSelectedActivity,
    getFilteredActivities,
    compareMode,
    setCompareMode
  } = useReputationStore()

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [comments, setComments] = useState<CommentSample[]>([])

  const filteredActivities = useMemo(() => getFilteredActivities(), [getFilteredActivities])

  const selectedActivity: Activity | undefined = useMemo(
    () => activities.find(a => a.id === selectedActivityId),
    [activities, selectedActivityId]
  )

  const previousSameTypeActivity: Activity | undefined = useMemo(() => {
    if (!selectedActivity) return undefined
    return getPreviousSameTypeActivity(selectedActivity.id, selectedActivity.type)
  }, [selectedActivity])

  const comparisonData = useMemo(() => {
    if (!selectedActivity || !previousSameTypeActivity || !compareMode) return null
    return selectedActivity.radarData.map((dim, i) => {
      const prev = previousSameTypeActivity.radarData[i] || { score: dim.previousScore }
      return {
        name: dim.name,
        current: dim.score,
        previous: prev.score,
        change: dim.score - prev.score,
        reason: dim.changeReason
      }
    })
  }, [selectedActivity, previousSameTypeActivity, compareMode])

  const topChanges = useMemo(() => {
    if (!comparisonData) return []
    return [...comparisonData]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 3)
      .filter(item => Math.abs(item.change) >= 2)
  }, [comparisonData])

  const relatedReviews = useMemo(() => {
    if (!selectedActivity) return []
    return getReviewsByActivityId(selectedActivity.id)
  }, [selectedActivity])

  const handleActivityChange = (id: string) => {
    setSelectedActivity(id)
    console.log('[CloudmapPage] activity changed:', id)
  }

  const handleKeywordClick = (keyword: KeywordItem) => {
    setCurrentKeyword(keyword.word)
    const commentList = getCommentsByKeyword(keyword.word, keyword.sentiment)
    setComments(commentList)
    setDrawerVisible(true)
    console.log('[CloudmapPage] keyword clicked:', keyword.word, 'comments count:', commentList.length)
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
  }

  const handleGoToReview = () => {
    Taro.switchTab({ url: '/pages/review/index' })
    console.log('[CloudmapPage] navigate to review page')
  }

  const toggleCompare = () => {
    const next = !compareMode
    setCompareMode(next)
    console.log('[CloudmapPage] compare mode:', next)
  }

  const getChangeClass = (change: number) => {
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'flat'
  }

  if (!selectedActivity) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text>暂无数据，请先在活动页选择一个活动</Text>
        </View>
      </View>
    )
  }

  const scoreChange = selectedActivity.scoreChange
  const scoreChangeText = getChangeText(scoreChange)
  const showCompare = compareMode && previousSameTypeActivity

  return (
    <View className={styles.page}>
      <ScrollView
        scrollX
        className={styles.activitySelector}
        showScrollbar={false}
      >
        {filteredActivities.map(activity => (
          <View
            key={activity.id}
            className={classnames(
              styles.activityItem,
              activity.id === selectedActivityId && styles.active
            )}
            onClick={() => handleActivityChange(activity.id)}
          >
            <Text className={styles.activityItemText}>
              {getActivityTypeLabel(activity.type)} · {activity.title.slice(0, 8)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        scrollY
        className={styles.content}
        showScrollbar={false}
      >
        <View className={styles.overallCard}>
          <View
            className={classnames(styles.compareToggle, compareMode && styles.on)}
            onClick={toggleCompare}
          >
            <Text className={styles.toggleText}>
              {compareMode ? '对比中' : '对比模式'}
            </Text>
          </View>

          <Text className={styles.overallTitle}>{selectedActivity.title}</Text>
          <View className={styles.overallScoreWrap}>
            <Text className={styles.overallScore}>{selectedActivity.overallScore}</Text>
            <Text className={styles.overallChange}>{scoreChangeText}</Text>
          </View>
          <Text className={styles.overallDesc}>{selectedActivity.summary}</Text>

          {showCompare && previousSameTypeActivity && (
            <View className={styles.compareInfo}>
              <Text className={styles.compareInfoLabel}>对比上一次{getActivityTypeLabel(previousSameTypeActivity.type)}：</Text>
              <View className={styles.compareInfoMain}>
                <Text className={styles.compareInfoScore}>{previousSameTypeActivity.overallScore}</Text>
                <Text className={styles.compareInfoTitle}>{previousSameTypeActivity.title}</Text>
              </View>
            </View>
          )}
        </View>

        {showCompare && topChanges.length > 0 && (
          <View className={styles.highlightCard}>
            <Text className={styles.highlightTitle}>
              ⚡ 变化最明显的 {topChanges.length} 项
            </Text>
            <View className={styles.highlightList}>
              {topChanges.map(item => (
                <View key={item.name} className={styles.highlightItem}>
                  <Text className={styles.highlightDimName}>{item.name}</Text>
                  <Text className={classnames(styles.highlightChange, getChangeClass(item.change))}>
                    {getChangeText(item.change)}
                  </Text>
                  <Text className={styles.highlightReason}>{item.reason}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>口碑雷达</Text>
            <Text className={styles.sectionTip}>满分 100</Text>
          </View>
          <RadarChart data={selectedActivity.radarData} size={520} />
          <View className={styles.legend}>
            <View className={styles.legendItem}>
              <View className={styles.legendDot} style={{ backgroundColor: '#00b42a' }}></View>
              <Text className={styles.legendText}>上升</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={styles.legendDot} style={{ backgroundColor: '#f53f3f' }}></View>
              <Text className={styles.legendText}>下降</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={styles.legendDot} style={{ backgroundColor: '#86909c' }}></View>
              <Text className={styles.legendText}>持平</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              {showCompare ? '维度对照' : '维度解读'}
            </Text>
            <Text className={styles.sectionTip}>
              {showCompare ? '与上次同类型活动对比' : '较上次活动'}
            </Text>
          </View>

          {showCompare && comparisonData ? (
            <View className={styles.dimensionList}>
              {comparisonData.map((dim, idx) => (
                <View key={dim.name} className={styles.dimensionItem}>
                  <View className={styles.dimensionHeader}>
                    <Text className={styles.dimensionName}>{dim.name}</Text>
                    <View className={styles.dimensionScore}>
                      <Text className={styles.dimensionScoreNum}>{dim.current}</Text>
                      <Text className={classnames(styles.dimensionChange, getChangeClass(dim.change))}>
                        {getChangeText(dim.change)}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.compareBarRow}>
                    <Text className={styles.compareBarLabel}>本次</Text>
                    <View className={styles.compareBarContainer}>
                      <View
                        className={styles.compareBarCurrent}
                        style={{ width: `${dim.current}%` }}
                      ></View>
                      <View
                        className={styles.compareBarPrevious}
                        style={{ width: `${dim.previous}%` }}
                      ></View>
                    </View>
                    <Text className={styles.compareBarLabel}>{dim.previous}</Text>
                  </View>
                  <Text className={styles.dimensionReason}>{dim.reason}</Text>
                </View>
              ))}
              <View className={styles.compareLegend}>
                <View className={styles.legendItem}>
                  <View className={styles.legendBar} style={{ backgroundColor: '#4f6ef7' }}></View>
                  <Text className={styles.legendText}>本次活动</Text>
                </View>
                <View className={styles.legendItem}>
                  <View className={styles.legendBar} style={{ backgroundColor: '#d4d9e5' }}></View>
                  <Text className={styles.legendText}>上次同类型活动</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className={styles.dimensionList}>
              {selectedActivity.radarData.map(dim => {
                const change = dim.score - dim.previousScore
                return (
                  <View key={dim.name} className={styles.dimensionItem}>
                    <View className={styles.dimensionHeader}>
                      <Text className={styles.dimensionName}>{dim.name}</Text>
                      <View className={styles.dimensionScore}>
                        <Text className={styles.dimensionScoreNum}>{dim.score}</Text>
                        <Text className={classnames(styles.dimensionChange, getChangeClass(change))}>
                          {getChangeText(change)}
                        </Text>
                      </View>
                    </View>
                    <View className={styles.dimensionBar}>
                      <View
                        className={styles.dimensionBarFill}
                        style={{ width: `${dim.score}%` }}
                      ></View>
                    </View>
                    <Text className={styles.dimensionReason}>{dim.changeReason}</Text>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>观众在说什么</Text>
            <Text className={styles.sectionTip}>点击查看评论样本</Text>
          </View>
          <KeywordCloud
            keywords={selectedActivity.keywords}
            onKeywordClick={handleKeywordClick}
            activeWord={currentKeyword}
          />
          <Text className={styles.keywordTip}>
            词频越高字号越大，绿色表示正面评价，灰色表示中性，红色表示负面。每个关键词均已匹配代表性原话。
          </Text>

          {relatedReviews.length > 0 && (
            <View className={styles.reviewLinkCard} onClick={handleGoToReview}>
              <View className={styles.reviewLinkInfo}>
                <Text className={styles.reviewLinkTitle}>
                  📋 本次活动有 {relatedReviews.length} 条复盘建议
                </Text>
                <Text className={styles.reviewLinkDesc}>
                  {relatedReviews.map(r => r.title).slice(0, 2).join('、')}
                  {relatedReviews.length > 2 ? '...' : ''}
                </Text>
              </View>
              <Text className={styles.reviewLinkArrow}>查看 →</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CommentDrawer
        visible={drawerVisible}
        keyword={currentKeyword}
        comments={comments}
        onClose={handleCloseDrawer}
      />
    </View>
  )
}

export default CloudmapPage
