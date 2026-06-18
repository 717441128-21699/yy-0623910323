import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { ReviewItemType } from '@/types/reputation'
import { REVIEW_CATEGORY_META } from '@/types/reputation'

interface ReviewItemProps {
  item: ReviewItemType
  onToggle?: (id: string) => void
}

const ReviewItem: React.FC<ReviewItemProps> = ({ item, onToggle }) => {
  const categoryInfo = REVIEW_CATEGORY_META.find(c => c.key === item.category) || REVIEW_CATEGORY_META[3]

  const getPriorityText = (priority: string) => {
    const map: Record<string, string> = {
      high: '高优先',
      medium: '中优先',
      low: '低优先'
    }
    return map[priority] || priority
  }

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      high: '#f53f3f',
      medium: '#ff7d00',
      low: '#86909c'
    }
    return map[priority] || '#86909c'
  }

  const handleToggle = () => {
    onToggle?.(item.id)
  }

  return (
    <View
      className={classnames(styles.item, item.status === 'done' && styles.done)}
      onClick={handleToggle}
    >
      <View className={styles.checkbox}>
        <View
          className={classnames(styles.checkboxInner, item.status === 'done' && styles.checked)}
        >
          {item.status === 'done' && <Text className={styles.checkmark}>✓</Text>}
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.header}>
          <View
            className={styles.categoryTag}
            style={{ backgroundColor: categoryInfo.bgColor, color: categoryInfo.color }}
          >
            <Text className={styles.categoryText}>{categoryInfo.label}</Text>
          </View>
          <Text
            className={styles.priorityTag}
            style={{ color: getPriorityColor(item.priority) }}
          >
            {getPriorityText(item.priority)}
          </Text>
        </View>

        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.description}>{item.description}</Text>
      </View>
    </View>
  )
}

export default ReviewItem
