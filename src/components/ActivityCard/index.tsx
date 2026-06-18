import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { Activity } from '@/types/reputation'
import { getActivityTypeLabel, getChangeText, getChangeColor } from '@/utils'
import { useReputationStore } from '@/store/useReputationStore'

interface ActivityCardProps {
  activity: Activity
  isSelected?: boolean
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isSelected }) => {
  const { setSelectedActivity } = useReputationStore()

  const handleClick = () => {
    setSelectedActivity(activity.id)
    Taro.switchTab({ url: '/pages/cloudmap/index' })
  }

  const changeColor = getChangeColor(activity.scoreChange)
  const changeText = getChangeText(activity.scoreChange)

  return (
    <View
      className={classnames(styles.card, isSelected && styles.selected)}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <View className={styles.typeTag}>
          <Text className={styles.typeText}>{getActivityTypeLabel(activity.type)}</Text>
        </View>
        <Text className={styles.date}>{activity.date}</Text>
      </View>

      <Text className={styles.title}>{activity.title}</Text>
      <Text className={styles.summary}>{activity.summary}</Text>

      <View className={styles.footer}>
        <View className={styles.scoreSection}>
          <Text className={styles.scoreLabel}>综合口碑</Text>
          <View className={styles.scoreWrap}>
            <Text className={styles.score}>{activity.overallScore}</Text>
            <Text className={styles.scoreMax} style={{ color: changeColor }}>
              {changeText}
            </Text>
          </View>
        </View>
        <View className={styles.commentSection}>
          <Text className={styles.commentCount}>{activity.totalComments} 条讨论</Text>
          <Text className={styles.arrow}>查看详情 →</Text>
        </View>
      </View>
    </View>
  )
}

export default ActivityCard
