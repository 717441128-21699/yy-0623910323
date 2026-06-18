import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { CommentSample, CommentType, COMMENT_TYPE_META } from '@/types/reputation'
import { formatNumber } from '@/utils'

interface CommentDrawerProps {
  visible: boolean
  keyword: string
  comments: CommentSample[]
  onClose: () => void
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({ visible, keyword, comments, onClose }) => {
  const [activeType, setActiveType] = useState<CommentType | 'all'>('all')

  const filteredComments = useMemo(() => {
    if (activeType === 'all') return comments
    return comments.filter(c => c.type === activeType)
  }, [comments, activeType])

  const getTypeInfo = (type: CommentType) => {
    return COMMENT_TYPE_META.find(m => m.key === type) || COMMENT_TYPE_META[0]
  }

  const typeFilters = [
    { key: 'all' as const, label: '全部' },
    ...COMMENT_TYPE_META
  ]

  if (!visible) return null

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.drawer} onClick={e => e.stopPropagation()}>
        <View className={styles.header}>
          <View className={styles.headerContent}>
            <Text className={styles.keyword}>"{keyword}"</Text>
            <Text className={styles.count}>共 {comments.length} 条代表性评论</Text>
          </View>
          <View className={styles.closeBtn} onClick={onClose}>
            <Text className={styles.closeText}>关闭</Text>
          </View>
        </View>

        <ScrollView
          scrollX
          className={styles.typeTabs}
          showScrollbar={false}
        >
          {typeFilters.map(item => (
            <View
              key={item.key}
              className={classnames(
                styles.typeTab,
                activeType === item.key && styles.typeTabActive
              )}
              style={{
                backgroundColor: activeType === item.key
                  ? ('color' in item ? item.color : '#4f6ef7')
                  : '#f2f3f5',
                color: activeType === item.key ? '#ffffff' : '#4e5969'
              }}
              onClick={() => setActiveType(item.key)}
            >
              <Text className={styles.typeTabText}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          scrollY
          className={styles.commentList}
          showScrollbar={false}
        >
          {filteredComments.length > 0 ? (
            filteredComments.map(comment => {
              const typeInfo = getTypeInfo(comment.type)
              return (
                <View key={comment.id} className={styles.commentItem}>
                  <View className={styles.commentHeader}>
                    <View
                      className={styles.typeBadge}
                      style={{ backgroundColor: typeInfo.bgColor, color: typeInfo.color }}
                    >
                      <Text className={styles.typeBadgeText}>{typeInfo.label}</Text>
                    </View>
                    <Text className={styles.source}>{comment.source}</Text>
                  </View>
                  <Text className={styles.commentContent}>{comment.content}</Text>
                  <View className={styles.commentFooter}>
                    <Text className={styles.time}>{comment.time}</Text>
                    <Text className={styles.likes}>❤️ {formatNumber(comment.likes)}</Text>
                  </View>
                </View>
              )
            })
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无相关评论</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default CommentDrawer
