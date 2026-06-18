import React, { useEffect, useRef } from 'react'
import { View, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { RadarDimension } from '@/types/reputation'

interface RadarChartProps {
  data: RadarDimension[]
  size?: number
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 500 }) => {
  const canvasRef = useRef<any>(null)
  const canvasId = 'radarCanvas'

  useEffect(() => {
    drawRadar()
  }, [data, size])

  const drawRadar = () => {
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          console.error('[RadarChart] canvas not found')
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio

        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        const centerX = size / 2
        const centerY = size / 2
        const radius = size * 0.32
        const sides = data.length

        ctx.clearRect(0, 0, size, size)

        for (let level = 5; level >= 1; level--) {
          const levelRadius = (radius * level) / 5
          ctx.beginPath()
          for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
            const x = centerX + levelRadius * Math.cos(angle)
            const y = centerY + levelRadius * Math.sin(angle)
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.strokeStyle = level === 5 ? '#e5e6eb' : '#f2f3f5'
          ctx.lineWidth = 1
          ctx.stroke()
          if (level % 2 === 1) {
            ctx.fillStyle = level === 5 ? 'rgba(79, 110, 247, 0.03)' : 'rgba(79, 110, 247, 0.02)'
            ctx.fill()
          }
        }

        for (let i = 0; i < sides; i++) {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
          ctx.strokeStyle = '#e5e6eb'
          ctx.lineWidth = 1
          ctx.stroke()
        }

        ctx.beginPath()
        data.forEach((item, i) => {
          const scoreRatio = item.score / 100
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
          const x = centerX + radius * scoreRatio * Math.cos(angle)
          const y = centerY + radius * scoreRatio * Math.sin(angle)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.closePath()

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        gradient.addColorStop(0, 'rgba(79, 110, 247, 0.3)')
        gradient.addColorStop(1, 'rgba(79, 110, 247, 0.1)')
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.strokeStyle = '#4f6ef7'
        ctx.lineWidth = 2
        ctx.stroke()

        data.forEach((item, i) => {
          const scoreRatio = item.score / 100
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
          const x = centerX + radius * scoreRatio * Math.cos(angle)
          const y = centerY + radius * scoreRatio * Math.sin(angle)

          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.strokeStyle = '#4f6ef7'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#4f6ef7'
          ctx.fill()
        })

        data.forEach((item, i) => {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
          const labelRadius = radius + 36
          const x = centerX + labelRadius * Math.cos(angle)
          const y = centerY + labelRadius * Math.sin(angle)

          ctx.font = '24rpx -apple-system, BlinkMacSystemFont, sans-serif'
          ctx.fillStyle = '#4e5969'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          ctx.fillText(item.name, x, y - 8)

          ctx.font = 'bold 28rpx -apple-system, BlinkMacSystemFont, sans-serif'
          ctx.fillStyle = '#1d2129'
          ctx.fillText(String(item.score), x, y + 22)
        })

        console.log('[RadarChart] radar chart drawn successfully')
      })
  }

  return (
    <View className={styles.radarContainer}>
      <Canvas
        type='2d'
        id={canvasId}
        canvasId={canvasId}
        className={styles.canvas}
        style={{ width: `${size}rpx`, height: `${size}rpx` }}
        ref={canvasRef}
      />
    </View>
  )
}

export default RadarChart
