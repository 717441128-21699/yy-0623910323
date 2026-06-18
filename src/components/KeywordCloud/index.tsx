import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { KeywordItem } from '@/types/reputation'
import { getSentimentColor } from '@/utils'

interface KeywordCloudProps {
  keywords: KeywordItem[]
  onKeywordClick?: (keyword: KeywordItem) => void
  activeWord?: string
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords, onKeywordClick, activeWord }) => {
  const getSize = (count: number) => {
    const maxCount = Math.max(...keywords.map(k => k.count))
    const minCount = Math.min(...keywords.map(k => k.count))
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    const sizes = [24, 26, 28, 32, 36]
    const index = Math.floor(ratio * 4)
    return sizes[index]
  }

  return (
    <View className={styles.cloudContainer}>
      {keywords.map((keyword, index) => {
        const size = getSize(keyword.count)
        const color = getSentimentColor(keyword.sentiment)
        return (
          <View
            key={keyword.word}
            className={classnames(
              styles.keywordTag,
              activeWord === keyword.word && styles.active
            )}
            style={{
              fontSize: `${size}rpx`,
              color: activeWord === keyword.word ? '#ffffff' : color,
              backgroundColor: activeWord === keyword.word ? color : 'transparent',
              animationDelay: `${index * 0.05}s`
            }}
            onClick={() => onKeywordClick?.(keyword)}
          >
            <Text className={styles.keywordText}>{keyword.word}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default KeywordCloud
