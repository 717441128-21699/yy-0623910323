import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore } from '@/store/useReputationStore'
import { getChangeText, getActivityTypeLabel, getSentimentColor } from '@/utils'
import { KeywordItem, CommentSample, Activity, ReviewItemType, REVIEW_CATEGORY_META } from '@/types/reputation'
import RadarChart from '@/components/RadarChart'
import KeywordCloud from '@/components/KeywordCloud'
import CommentDrawer from '@/components/CommentDrawer'
import { getCommentsByKeyword, getPreviousSameTypeActivity, getReviewsByActivityId, getKeywordsByDimension } from '@/data/mockData'

const CloudmapPage: React.FC = () => {
  const {
    activities,
    reviewItems,
    selectedActivityId,
    setSelectedActivity,
    toggleReviewStatus,
    getFilteredActivities,
    compareMode,
    setCompareMode,
    resetFilters
  } = useReputationStore()

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [comments, setComments] = useState<CommentSample[]>([])
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set())

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
      const prev = previousSameTypeActivity.radarData[i] || { score: dim.previousScore, changeReason: '' }
      return {
        name: dim.name,
        current: dim.score,
        previous: prev.score,
        change: dim.score - prev.score,
        reason: dim.changeReason,
        previousReason: prev.changeReason || '上次活动同维度表现'
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

  const relatedReviews: ReviewItemType[] = useMemo(() => {
    if (!selectedActivity) return []
    return getReviewsByActivityId(selectedActivity.id)
  }, [selectedActivity, reviewItems])

  const handleActivityChange = (id: string) => {
    setSelectedActivity(id)
    setExpandedDimensions(new Set())
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
    setExpandedDimensions(new Set())
    console.log('[CloudmapPage] compare mode:', next)
  }

  const toggleDimensionExpand = (dimName: string) => {
    setExpandedDimensions(prev => {
      const next = new Set(prev)
      if (next.has(dimName)) next.delete(dimName)
      else next.add(dimName)
      return next
    })
    console.log('[CloudmapPage] toggle dimension expand:', dimName)
  }

  const handleToggleReview = (id: string) => {
    toggleReviewStatus(id)
    console.log('[CloudmapPage] toggle review from cloudmap:', id)
  }

  const handleResetFilters = () => {
    resetFilters()
    setCompareMode(false)
    setExpandedDimensions(new Set())
    console.log('[CloudmapPage] reset filters')
  }

  const getChangeClass = (change: number) => {
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'flat'
  }

  const getCategoryMeta = (category: string) => {
    return REVIEW_CATEGORY_META.find(m => m.key === category)
  }

  if (filteredActivities.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyScreen}>
          <Text className={styles.emptyEmoji}>🔍</Text>
          <Text className={styles.emptyTitle}>未找到匹配的活动</Text>
          <Text className={styles.emptyDesc}>请尝试调整搜索关键词或时间范围</Text>
          <View className={styles.emptyBtn} onClick={handleResetFilters}>
            <Text className={styles.emptyBtnText}>查看全部活动</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!selectedActivity) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyScreen}>
          <Text className={styles.emptyEmoji}>📋</Text>
          <Text className={styles.emptyTitle}>请先选择一个活动</Text>
          <View className={styles.emptyBtn} onClick={handleResetFilters}>
            <Text className={styles.emptyBtnText}>返回活动列表</Text>
          </View>
        </View>
      </View>
    )
  }

  const scoreChange = selectedActivity.scoreChange
  const scoreChangeText = getChangeText(scoreChange)
  const showCompare = compareMode && previousSameTypeActivity
  const compareModeNoData = compareMode && !previousSameTypeActivity

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

          {compareModeNoData && (
            <View className={styles.compareEmpty}>
              <Text className={styles.compareEmptyIcon}>📊</Text>
              <View className={styles.compareEmptyText}>
                <Text className={styles.compareEmptyTitle}>暂无上一次同类型活动可对比</Text>
                <Text className={styles.compareEmptyDesc}>这是最早的一次{getActivityTypeLabel(selectedActivity.type)}活动</Text>
              </View>
            </View>
          )}

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
              {showCompare ? '维度对照（点击展开详情）' : '维度解读（点击展开详情）'}
            </Text>
            <Text className={styles.sectionTip}>
              {showCompare ? '与上次同类型活动对比' : '较上次活动'}
            </Text>
          </View>

          {showCompare && comparisonData ? (
            <View className={styles.dimensionList}>
              {comparisonData.map((dim) => {
                const isExpanded = expandedDimensions.has(dim.name)
                const dimKeywords = getKeywordsByDimension(selectedActivity, dim.name)
                const prevKeywords = getKeywordsByDimension(previousSameTypeActivity!, dim.name)
                const sampleComment = dimKeywords.length > 0
                  ? getCommentsByKeyword(dimKeywords[0].word, dimKeywords[0].sentiment)[0]
                  : null
                return (
                  <View key={dim.name} className={styles.dimensionItem}>
                    <View
                      className={classnames(styles.dimensionHeader, styles.clickable)}
                      onClick={() => toggleDimensionExpand(dim.name)}
                    >
                      <View className={styles.dimensionNameWrap}>
                        <Text className={styles.dimensionName}>{dim.name}</Text>
                        <Text className={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                      </View>
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

                    {isExpanded && (
                      <View className={styles.dimensionExpand}>
                        <View className={styles.dimCompareBlock}>
                          <View className={styles.dimCompareCol}>
                            <View className={styles.dimCompareHeader}>
                              <View className={styles.dimCompareDot} style={{ backgroundColor: '#4f6ef7' }}></View>
                              <Text className={styles.dimCompareTitle}>本次活动</Text>
                              <Text className={styles.dimCompareScore}>{dim.current}分</Text>
                            </View>
                            <Text className={styles.dimCompareReason}>{dim.reason}</Text>
                            {dimKeywords.length > 0 && (
                              <View className={styles.dimKeywords}>
                                {dimKeywords.map(kw => (
                                  <View
                                    key={kw.word}
                                    className={styles.dimKeywordTag}
                                    style={{ backgroundColor: getSentimentColor(kw.sentiment) + '20', color: getSentimentColor(kw.sentiment) }}
                                  >
                                    <Text>{kw.word}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                          <View className={styles.dimCompareDivider}></View>
                          <View className={styles.dimCompareCol}>
                            <View className={styles.dimCompareHeader}>
                              <View className={styles.dimCompareDot} style={{ backgroundColor: '#d4d9e5' }}></View>
                              <Text className={styles.dimCompareTitle}>上次活动</Text>
                              <Text className={styles.dimCompareScore}>{dim.previous}分</Text>
                            </View>
                            <Text className={styles.dimCompareReason}>{dim.previousReason}</Text>
                            {prevKeywords.length > 0 && (
                              <View className={styles.dimKeywords}>
                                {prevKeywords.map(kw => (
                                  <View
                                    key={kw.word}
                                    className={styles.dimKeywordTag}
                                    style={{ backgroundColor: getSentimentColor(kw.sentiment) + '20', color: getSentimentColor(kw.sentiment) }}
                                  >
                                    <Text>{kw.word}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        </View>

                        {sampleComment && (
                          <View className={styles.dimSampleComment}>
                            <View className={styles.dimSampleCommentHeader}>
                              <Text className={styles.dimSampleCommentLabel}>代表评论</Text>
                              <Text className={styles.dimSampleCommentSource}>{sampleComment.source}</Text>
                            </View>
                            <Text className={styles.dimSampleCommentContent}>"{sampleComment.content}"</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
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
                const isExpanded = expandedDimensions.has(dim.name)
                const dimKeywords = getKeywordsByDimension(selectedActivity, dim.name)
                const sampleComment = dimKeywords.length > 0
                  ? getCommentsByKeyword(dimKeywords[0].word, dimKeywords[0].sentiment)[0]
                  : null
                return (
                  <View key={dim.name} className={styles.dimensionItem}>
                    <View
                      className={classnames(styles.dimensionHeader, styles.clickable)}
                      onClick={() => toggleDimensionExpand(dim.name)}
                    >
                      <View className={styles.dimensionNameWrap}>
                        <Text className={styles.dimensionName}>{dim.name}</Text>
                        <Text className={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                      </View>
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

                    {isExpanded && (
                      <View className={styles.dimensionExpand}>
                        <Text className={styles.dimensionExpandReason}>{dim.changeReason}</Text>
                        {dimKeywords.length > 0 && (
                          <View className={styles.dimKeywords}>
                            <Text className={styles.dimKeywordsLabel}>高频关键词：</Text>
                            {dimKeywords.map(kw => (
                              <View
                                key={kw.word}
                                className={styles.dimKeywordTag}
                                style={{ backgroundColor: getSentimentColor(kw.sentiment) + '20', color: getSentimentColor(kw.sentiment) }}
                              >
                                <Text>{kw.word}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {sampleComment && (
                          <View className={styles.dimSampleComment}>
                            <View className={styles.dimSampleCommentHeader}>
                              <Text className={styles.dimSampleCommentLabel}>代表评论</Text>
                              <Text className={styles.dimSampleCommentSource}>{sampleComment.source}</Text>
                            </View>
                            <Text className={styles.dimSampleCommentContent}>"{sampleComment.content}"</Text>
                          </View>
                        )}
                      </View>
                    )}
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
        </View>

        {relatedReviews.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>📋 本次活动复盘建议</Text>
              <Text className={styles.sectionTip}>点击勾选可标记完成</Text>
            </View>
            <View className={styles.inlineReviewList}>
              {relatedReviews.map(review => {
                const catMeta = getCategoryMeta(review.category)
                return (
                  <View
                    key={review.id}
                    className={classnames(styles.inlineReviewItem, review.status === 'done' && styles.done)}
                  >
                    <View
                      className={styles.inlineReviewCheckbox}
                      onClick={() => handleToggleReview(review.id)}
                    >
                      <View className={classnames(styles.checkboxInner, review.status === 'done' && styles.checked)}>
                        {review.status === 'done' && <Text className={styles.checkmark}>✓</Text>}
                      </View>
                    </View>
                    <View className={styles.inlineReviewContent}>
                      <View className={styles.inlineReviewHeader}>
                        <View
                          className={styles.inlineReviewCategory}
                          style={{ backgroundColor: catMeta?.color + '15', color: catMeta?.color }}
                        >
                          <Text>{catMeta?.label}</Text>
                        </View>
                        {review.priority === 'high' && (
                          <Text className={styles.inlineReviewPriority}>高优</Text>
                        )}
                      </View>
                      <Text className={styles.inlineReviewTitle}>{review.title}</Text>
                      <Text className={styles.inlineReviewDesc}>{review.description}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
            <View className={styles.viewAllReviewBtn} onClick={handleGoToReview}>
              <Text className={styles.viewAllReviewText}>查看完整复盘清单 →</Text>
            </View>
          </View>
        )}
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
