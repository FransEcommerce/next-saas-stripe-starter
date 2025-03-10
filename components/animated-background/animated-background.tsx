"use client"

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小为窗口大小
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    // 初始化粒子
    const initParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 9000), 100)
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 1,
          speedX: (Math.random() - 0.5) * 1,
          speedY: (Math.random() - 0.5) * 1,
          color: getRandomColor()
        })
      }
      
      particlesRef.current = particles
    }

    // 获取随机颜色
    const getRandomColor = () => {
      const colors = [
        'rgba(39, 184, 236, 0.7)',
        'rgba(78, 102, 236, 0.7)',
        'rgba(111, 64, 221, 0.7)',
        'rgba(61, 184, 204, 0.7)',
        'rgba(54, 76, 219, 0.7)'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach((particle, i) => {
        // 更新粒子位置
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        // 边界检测
        if (particle.x > canvas.width) particle.x = 0
        else if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        else if (particle.y < 0) particle.y = canvas.height
        
        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
        
        // 绘制连接线
        connectParticles(particle, i)
      })
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    // 连接临近粒子
    const connectParticles = (particle: Particle, index: number) => {
      const distance = 150
      
      for (let i = index + 1; i < particlesRef.current.length; i++) {
        const otherParticle = particlesRef.current[i]
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < distance) {
          // 基于距离计算不透明度
          const opacity = 1 - (dist / distance)
          
          ctx.beginPath()
          ctx.strokeStyle = particle.color.replace(/[^,]+(?=\))/, opacity.toString())
          ctx.lineWidth = 0.5
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      }
    }
    
    // 鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    
    // 初始化
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize()
    animate()
    
    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-gradient-to-b from-background to-background/80"
    />
  )
}
