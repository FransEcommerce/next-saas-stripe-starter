"use client"

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface CodeRainProps {
  // 代码雨颜色，可以是单色或多色
  colors?: string[];
  // 下落速度（值越小越快）
  fallSpeed?: number;
  // 代码密度（0-1之间，值越大密度越高）
  density?: number;
  // 代码出现率（0-1之间，值越大出现越频繁）
  spawnRate?: number;
  // 字体大小
  fontSize?: number;
  // 是否启用中心暗角
  centerVignette?: boolean;
  // 是否启用外部暗角
  outerVignette?: boolean;
  // 中心暗角大小 (0-100)
  vignetteSize?: number;
  // 中心暗角强度 (0-1)
  vignetteIntensity?: number;
  // 代码雨长度范围 [最小长度, 最大长度]
  rainLengthRange?: [number, number];
  // 二进制模式，只显示0和1
  binaryMode?: boolean;
}

interface RainDrop {
  x: number;        // x坐标
  y: number;        // y坐标
  length: number;   // 雨滴长度
  speed: number;    // 下落速度
  chars: string[];  // 字符数组
  color: string;    // 颜色
  head: number;     // 头部位置
}

const CodeRainBackground: React.FC<CodeRainProps> = ({
  colors = ["#0f0", "#00ff9f", "#00b3ff"],
  fallSpeed = 15,
  density = 0.05,
  spawnRate = 0.1,
  fontSize = 16,
  centerVignette = false,
  outerVignette = true,
  vignetteSize = 40,
  vignetteIntensity = 0.9,
  rainLengthRange = [5, 20],
  binaryMode = false
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const raindrops = useRef<RainDrop[]>([]);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastUpdateTime = useRef(Date.now());

  // 字符宽高比例
  const charWidth = fontSize * 0.625;
  const charHeight = fontSize;

  // 组件挂载状态
  useEffect(() => {
    setMounted(true);
  }, []);

  // 当主题变化时更新currentTheme状态
  useEffect(() => {
    setCurrentTheme(resolvedTheme);
  }, [resolvedTheme]);

  // 可用字符集 - 根据二进制模式选择
  const characters = binaryMode 
    ? ["0", "1"]
    : [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
        "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "+", "-", "*", "/", "=", "!", "@", "#", "$", "%", "^", "&", "*",
        "(", ")", "[", "]", "{", "}", "<", ">", "?", "|", "\\", ":", ";",
        "\"", "'", ",", ".", "_", "~", "`"
      ];

  // 获取随机字符
  const getRandomChar = () => {
    return characters[Math.floor(Math.random() * characters.length)];
  };

  // 获取随机颜色
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 创建新的雨滴
  const createRaindrop = (width: number) => {
    const length = Math.floor(
      Math.random() * (rainLengthRange[1] - rainLengthRange[0] + 1) + rainLengthRange[0]
    );
    
    const chars = Array(length).fill(0).map(() => getRandomChar());
    
    return {
      x: Math.floor(Math.random() * (width / charWidth)) * charWidth,
      y: -length * charHeight, // 从画布上方开始
      length,
      speed: (Math.random() * 0.5 + 0.5) * (20 / fallSpeed), // 速度随机但基于fallSpeed参数
      chars,
      color: getRandomColor(),
      head: 0 // 头部位置初始化为0
    };
  };

  // 调整画布大小
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.current.font = `${fontSize}px monospace`;
      context.current.textBaseline = "top";
    }
  };

  // 更新和绘制雨滴
  const updateAndDrawRaindrops = () => {
    if (!context.current || !canvasRef.current) return;
    
    const ctx = context.current;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 根据出现率创建新雨滴
    if (Math.random() < spawnRate * density) {
      const maxRaindrops = Math.ceil(width / charWidth * density * 2);
      if (raindrops.current.length < maxRaindrops) {
        raindrops.current.push(createRaindrop(width));
      }
    }
    
    // 更新和绘制每个雨滴
    raindrops.current = raindrops.current.filter(drop => {
      // 更新头部位置
      drop.head = Math.min(drop.length - 1, drop.head + 1);
      
      // 更新y坐标
      drop.y += drop.speed;
      
      // 如果雨滴完全离开屏幕，则移除
      if (drop.y - drop.length * charHeight > height) {
        return false;
      }
      
      // 绘制雨滴中的每个字符
      for (let i = 0; i < drop.length; i++) {
        // 计算字符的y坐标
        const y = drop.y - (drop.length - i) * charHeight;
        
        // 如果字符在屏幕内，则绘制
        if (y >= -charHeight && y < height) {
          // 随机更改字符（概率较低）
          if (Math.random() < 0.01) {
            drop.chars[i] = getRandomChar();
          }
          
          // 计算不透明度 - 头部最亮，尾部逐渐变暗
          let opacity = 1;
          if (i === drop.head) {
            opacity = 1; // 头部字符完全不透明
          } else {
            // 从头部到尾部逐渐变暗
            opacity = Math.max(0.1, 1 - (drop.head - i) / drop.length);
          }
          
          ctx.fillStyle = drop.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
          ctx.fillText(drop.chars[i], drop.x, y);
        }
      }
      
      return true;
    });
  };

  // 动画循环
  const animate = () => {
    updateAndDrawRaindrops();
    animationRef.current = requestAnimationFrame(animate);
  };

  // 初始化和清理
  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");
    if (!context.current) return;
    
    resizeCanvas();
    animate();

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animate();
      }, 100);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [fallSpeed, density, spawnRate, fontSize, mounted, binaryMode]);

  // 根据主题计算中心渐变的颜色
  const getVignetteColor = () => {
    // 确保使用当前主题，避免服务器端渲染错误
    if (currentTheme === 'dark') {
      return `rgba(0,0,0,${vignetteIntensity})`;
    } else {
      return `rgba(255,255,255,${vignetteIntensity})`;
    }
  };

  // 计算中心暗角的样式 - 根据主题调整
  const centerVignetteStyle = {
    background: `radial-gradient(circle, ${getVignetteColor()} 0%, ${getVignetteColor().replace(vignetteIntensity.toString(), (vignetteIntensity * 0.8).toString())} ${vignetteSize * 0.5}%, rgba(0,0,0,0) ${vignetteSize}%)`
  };

  // 计算外部暗角的样式
  const outerVignetteStyle = {
    background: "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)"
  };

  // 如果组件尚未挂载，返回一个空的占位符
  if (!mounted) {
    return <div className="relative w-full h-full bg-background"></div>;
  }

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {outerVignette && (
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={outerVignetteStyle}
        ></div>
      )}
      {centerVignette && (
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={centerVignetteStyle}
          data-theme={currentTheme}
        ></div>
      )}
    </div>
  );
};

export default CodeRainBackground;
