import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useReputationStore } from '@/store/useReputationStore'
import { getChangeText, getActivityTypeLabel } from '@/utils'
import { KeywordItem, CommentSample } from '@/types/reputation'
import RadarChart from '@/components/RadarChart'
import KeywordCloud from '@/components/KeywordCloud'
import CommentDrawer from '@/components/CommentDrawer'
import { getCommentsByKeyword } from '@/data/mockData'

const CloudmapPage: React.FC = () => {
  const { activities, selectedActivityId, setSelectedActivity } = useReputationStore()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [comments, setComments] = useState<CommentSample[]>([])

  const selectedActivity = useMemo(
    () => activities.find(a => a.id === selectedActivityId),
    [activities, selectedActivityId]
  )

  const handleActivityChange = (id: string) => {
    setSelectedActivity(id)
    console.log('[CloudmapPage] activity changed:', id)
  }

  const handleKeywordClick = (keyword: KeywordItem) => {
    setCurrentKeyword(keyword.word)
    const commentList = getCommentsByKeyword(keyword.word)
    setComments(commentList)
    setDrawerVisible(true)
    console.log('[CloudmapPage] keyword clicked:', keyword.word)
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
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
          <Text>暂无数据</Text>
        </View>
      </View>
    )
  }

  const scoreChange = selectedActivity.scoreChange
  const scoreChangeText = getChangeText(scoreChange)

  return (
    <View className={styles.page}>
      <ScrollView
        scrollX
        className={styles.activitySelector}
        showScrollbar={false}
      >
        {activities.map(activity => (
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
          <Text className={styles.overallTitle}>{selectedActivity.title}</Text>
          <View className={styles.overallScoreWrap}>
            <Text className={styles.overallScore}>{selectedActivity.overallScore}</Text>
            <Text className={styles.overallChange}>{scoreChangeText}</Text>
          </View>
          <Text className={styles.overallDesc}>{selectedActivity.summary}</Text>
        </View>

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
            <Text className={styles.sectionTitle}>维度解读</Text>
            <Text className={styles.sectionTip}>较上次活动</Text>
          </View>
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
            词频越高字号越大，绿色表示正面评价，灰色表示中性，红色表示负面。
          </Text>
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
