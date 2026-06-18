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
import { getCommentsByKeyword, getPreviousSameTypeActivity, getKeywordsByDimension } from '@/data/mockData'

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
  const [scrollTargetId, setScrollTargetId] = useState<string>('')

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

  const comparisonSummary = useMemo(() => {
    if (!selectedActivity || !previousSameTypeActivity || !comparisonData) return ''
    const overallDiff = selectedActivity.overallScore - previousSameTypeActivity.overallScore
    const diffText = overallDiff > 0 ? `+${overallDiff}` : String(overallDiff)

    const topUp = comparisonData.filter(d => d.change > 0).sort((a, b) => b.change - a.change)[0]
    const topDown = comparisonData.filter(d => d.change < 0).sort((a, b) => a.change - b.change)[0]

    const upKeywords = topUp && selectedActivity
      ? getKeywordsByDimension(selectedActivity, topUp.name).map(k => k.word).join('、')
      : ''
    const downKeywords = topDown && selectedActivity
      ? getKeywordsByDimension(selectedActivity, topDown.name).map(k => k.word).join('、')
      : ''

    let result = `【${selectedActivity.title} vs ${previousSameTypeActivity.title}】\n`
    result += `综合分：${selectedActivity.overallScore}分（${diffText === '0' ? '持平' : diffText}）\n\n`

    if (topUp) {
      result += `🌟 提升最明显：${topUp.name} ${topUp.change > 0 ? '+' : ''}${topUp.change}分\n`
      result += `   原因：${topUp.reason}\n`
      if (upKeywords) result += `   相关热词：${upKeywords}\n`
    }
    if (topDown) {
      result += `\n⚠️ 下滑最明显：${topDown.name} ${topDown.change}分\n`
      result += `   原因：${topDown.reason}\n`
      if (downKeywords) result += `   相关热词：${downKeywords}\n`
    }
    if (!topUp && !topDown) {
      result += '各维度整体稳定，没有明显的大幅变化。\n'
    }
    return result
  }, [selectedActivity, previousSameTypeActivity, comparisonData])

  const reportCardData = useMemo(() => {
    if (!selectedActivity || !previousSameTypeActivity || !comparisonData) return null
    const overallDiff = selectedActivity.overallScore - previousSameTypeActivity.overallScore

    const topUp = comparisonData.filter(d => d.change > 0).sort((a, b) => b.change - a.change)[0]
    const topDown = comparisonData.filter(d => d.change < 0).sort((a, b) => a.change - b.change)[0]

    const upKeywords = topUp
      ? getKeywordsByDimension(selectedActivity, topUp.name).slice(0, 3)
      : []
    const downKeywords = topDown
      ? getKeywordsByDimension(selectedActivity, topDown.name).slice(0, 3)
      : []

    const highPriorityPending = relatedReviews
      .filter(r => r.status === 'pending' && r.priority === 'high')
      .slice(0, 2)

    const nextSteps: string[] = []
    if (topDown) {
      nextSteps.push(`重点提升「${topDown.name}」维度，关注相关讨论方向`)
    }
    if (highPriorityPending.length > 0) {
      nextSteps.push(`优先处理 ${highPriorityPending.length} 项高优复盘建议`)
    }
    if (topUp) {
      nextSteps.push(`延续「${topUp.name}」的成功经验`)
    }
    if (nextSteps.length === 0) {
      nextSteps.push('保持当前节奏，各维度整体稳定')
    }

    return {
      activityTitle: selectedActivity.title,
      compareTitle: previousSameTypeActivity.title,
      overallScore: selectedActivity.overallScore,
      previousScore: previousSameTypeActivity.overallScore,
      overallDiff,
      topUp,
      topDown,
      upKeywords,
      downKeywords,
      highPriorityPending,
      nextSteps,
      date: new Date('2024-06-19').toLocaleDateString('zh-CN')
    }
  }, [selectedActivity, previousSameTypeActivity, comparisonData, relatedReviews])

  const handleCopySummary = () => {
    if (!comparisonSummary) return
    Taro.setClipboardData({
      data: comparisonSummary,
      success: () => {
        Taro.showToast({ title: '已复制到剪贴板', icon: 'success', duration: 1500 })
      }
    })
    console.log('[CloudmapPage] copy summary to clipboard')
  }

  const relatedReviews: ReviewItemType[] = useMemo(() => {
    if (!selectedActivity) return []
    return reviewItems.filter(item => item.relatedActivityId === selectedActivity.id)
  }, [selectedActivity, reviewItems])

  const reviewStats = useMemo(() => {
    const total = relatedReviews.length
    const done = relatedReviews.filter(r => r.status === 'done').length
    const pending = total - done
    const pendingHigh = relatedReviews.filter(r => r.status === 'pending' && r.priority === 'high').length
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, pending, pendingHigh, progress }
  }, [relatedReviews])

  const highPriorityPendingReviews = useMemo(() => {
    return relatedReviews.filter(r => r.status === 'pending' && r.priority === 'high')
  }, [relatedReviews])

  const handleHighPriorityClick = (reviewId: string) => {
    setScrollTargetId(`review-${reviewId}`)
    setTimeout(() => setScrollTargetId(''), 500)
    console.log('[CloudmapPage] scroll to review:', reviewId)
  }

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
        scrollIntoView={scrollTargetId}
        scrollWithAnimation
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
            {reportCardData && (
              <View className={styles.reportCard}>
                <View className={styles.reportCardHeader}>
                  <View>
                    <Text className={styles.reportCardTitle}>口碑对比报告</Text>
                    <Text className={styles.reportCardSubtitle}>
                      {reportCardData.activityTitle}
                    </Text>
                  </View>
                  <View className={styles.reportCardCopy} onClick={handleCopySummary}>
                    <Text className={styles.reportCardCopyText}>复制</Text>
                  </View>
                </View>

                <View className={styles.reportCardScore}>
                  <View className={styles.reportCardScoreMain}>
                    <Text className={styles.reportCardScoreNum}>{reportCardData.overallScore}</Text>
                    <Text className={styles.reportCardScoreLabel}>本次综合分</Text>
                  </View>
                  <View className={styles.reportCardVs}>
                    <Text className={styles.reportCardVsText}>VS</Text>
                  </View>
                  <View className={styles.reportCardScoreMain}>
                    <Text className={styles.reportCardScoreNum} style={{ color: '#86909c' }}>{reportCardData.previousScore}</Text>
                    <Text className={styles.reportCardScoreLabel}>上次综合分</Text>
                  </View>
                  <View className={classnames(styles.reportCardDiff, getChangeClass(reportCardData.overallDiff))}>
                    <Text className={styles.reportCardDiffText}>
                      {getChangeText(reportCardData.overallDiff)}
                    </Text>
                  </View>
                </View>

                <View className={styles.reportCardChanges}>
                  {reportCardData.topUp && (
                    <View className={styles.reportCardChangeItem}>
                      <View className={styles.reportCardChangeHeader}>
                        <Text className={styles.reportCardChangeIcon}>�</Text>
                        <Text className={styles.reportCardChangeTitle}>最大提升</Text>
                      </View>
                      <Text className={styles.reportCardChangeDim}>{reportCardData.topUp.name}</Text>
                      <Text className={classnames(styles.reportCardChangeVal, 'up')}>
                        +{reportCardData.topUp.change} 分
                      </Text>
                      <Text className={styles.reportCardChangeReason}>{reportCardData.topUp.reason}</Text>
                      {reportCardData.upKeywords.length > 0 && (
                        <View className={styles.reportCardKeywords}>
                          {reportCardData.upKeywords.map(kw => (
                            <Text key={kw.word} className={styles.reportCardKeyword} style={{ color: '#00b42a', backgroundColor: 'rgba(0,180,42,0.1)' }}>
                              {kw.word}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {reportCardData.topDown && (
                    <View className={styles.reportCardChangeItem}>
                      <View className={styles.reportCardChangeHeader}>
                        <Text className={styles.reportCardChangeIcon}>📉</Text>
                        <Text className={styles.reportCardChangeTitle}>最大下滑</Text>
                      </View>
                      <Text className={styles.reportCardChangeDim}>{reportCardData.topDown.name}</Text>
                      <Text className={classnames(styles.reportCardChangeVal, 'down')}>
                        {reportCardData.topDown.change} 分
                      </Text>
                      <Text className={styles.reportCardChangeReason}>{reportCardData.topDown.reason}</Text>
                      {reportCardData.downKeywords.length > 0 && (
                        <View className={styles.reportCardKeywords}>
                          {reportCardData.downKeywords.map(kw => (
                            <Text key={kw.word} className={styles.reportCardKeyword} style={{ color: '#f53f3f', backgroundColor: 'rgba(245,63,63,0.1)' }}>
                              {kw.word}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {reportCardData.highPriorityPending.length > 0 && (
                  <View className={styles.reportCardSection}>
                    <Text className={styles.reportCardSectionTitle}>⚡ 高优待办</Text>
                    {reportCardData.highPriorityPending.map(item => (
                      <View key={item.id} className={styles.reportCardTodo}>
                        <View className={styles.reportCardTodoDot}></View>
                        <Text className={styles.reportCardTodoText}>{item.title}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className={styles.reportCardSection}>
                  <Text className={styles.reportCardSectionTitle}>💡 下一步建议</Text>
                  {reportCardData.nextSteps.map((step, i) => (
                    <View key={i} className={styles.reportCardNext}>
                      <Text className={styles.reportCardNextNum}>{i + 1}</Text>
                      <Text className={styles.reportCardNextText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <View className={styles.reportCardFooter}>
                  <Text className={styles.reportCardDate}>生成于 {reportCardData.date}</Text>
                  <Text className={styles.reportCardBrand}>口碑云图</Text>
                </View>
              </View>
            )}
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

            <View className={styles.reviewProgress}>
              <View className={styles.progressRow}>
                <View className={styles.progressInfo}>
                  <Text className={styles.progressLabel}>收尾进度</Text>
                  <Text className={styles.progressPercent}>{reviewStats.progress}%</Text>
                </View>
                <View className={styles.progressBar}>
                  <View
                    className={styles.progressBarFill}
                    style={{ width: `${reviewStats.progress}%` }}
                  ></View>
                </View>
              </View>
              <View className={styles.progressStats}>
                <View className={styles.progressStat}>
                  <Text className={styles.progressStatNum}>{reviewStats.total}</Text>
                  <Text className={styles.progressStatLabel}>总建议</Text>
                </View>
                <View className={styles.progressStat}>
                  <Text className={styles.progressStatNum} style={{ color: '#00b42a' }}>{reviewStats.done}</Text>
                  <Text className={styles.progressStatLabel}>已处理</Text>
                </View>
                <View className={styles.progressStat}>
                  <Text className={styles.progressStatNum} style={{ color: '#86909c' }}>{reviewStats.pending}</Text>
                  <Text className={styles.progressStatLabel}>待处理</Text>
                </View>
                {reviewStats.pendingHigh > 0 && (
                  <View className={styles.progressStat}>
                    <Text className={styles.progressStatNum} style={{ color: '#f53f3f' }}>{reviewStats.pendingHigh}</Text>
                    <Text className={styles.progressStatLabel}>高优待办</Text>
                  </View>
                )}
              </View>

              {highPriorityPendingReviews.length > 0 && (
                <View className={styles.highPriorityList}>
                  <Text className={styles.highPriorityLabel}>
                    ⚡ 高优先收事项
                  </Text>
                  {highPriorityPendingReviews.map(review => {
                    const catMeta = getCategoryMeta(review.category)
                    return (
                      <View
                        key={review.id}
                        className={styles.highPriorityItem}
                        onClick={() => handleHighPriorityClick(review.id)}
                      >
                        <View
                          className={styles.highPriorityCat}
                          style={{ backgroundColor: catMeta?.color + '20', color: catMeta?.color }}
                        >
                          <Text>{catMeta?.label}</Text>
                        </View>
                        <Text className={styles.highPriorityTitle}>{review.title}</Text>
                        <Text className={styles.highPriorityArrow}>↓</Text>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>

            <View className={styles.inlineReviewList}>
              {relatedReviews.map(review => {
                const catMeta = getCategoryMeta(review.category)
                return (
                  <View
                    key={review.id}
                    id={`review-${review.id}`}
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
