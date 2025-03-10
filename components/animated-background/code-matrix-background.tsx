"use client"

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface CodeMatrixProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  density?: number;
  fontSize?: number;
  vignetteSize?: number; // 暗角大小参数 (0-100)
  vignetteIntensity?: number; // 暗角强度参数 (0-1)
  binaryMode?: boolean; // 二进制模式，只显示0和1
}

const CodeMatrixBackground: React.FC<CodeMatrixProps> = ({
  glitchColors = ["#0f172a", "#64748b", "#94a3b8"],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  density = 1,
  fontSize = 16,
  vignetteSize = 40, // 默认暗角大小为40%
  vignetteIntensity = 0.9, // 默认暗角强度为0.9
  binaryMode = false, // 默认不启用二进制模式
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());

  const charWidth = fontSize * 0.625; // Approximately 10px for 16px font
  const charHeight = fontSize * 1.25; // Approximately 20px for 16px font

  // 组件挂载状态和主题检测
  useEffect(() => {
    // 设置挂载状态
    setMounted(true);
    
    // 获取初始主题
    const initialTheme = resolvedTheme || theme;
    setCurrentTheme(initialTheme);
    
    // 渐变显示整个组件
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(fadeInTimeout);
  }, [resolvedTheme, theme]);

  // 当主题变化时更新currentTheme状态
  useEffect(() => {
    if (mounted) {
      setCurrentTheme(resolvedTheme || theme);
    }
  }, [resolvedTheme, theme, mounted]);

  // 根据是否启用二进制模式选择字符集
  const lettersAndSymbols = binaryMode 
    ? ["0", "1"] 
    : [
        "0", "1", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "!", "@", "#", "$", "&", "*", "(", ")", "-", "_", "+", "=", "/",
        "[", "]", "{", "}", ";", ":", "<", ">", ",", "0", "1", "2", "3",
        "4", "5", "6", "7", "8", "9", ".", "?", "\"", "'", "|", "\\", "~",
        "`", "^", "%"
      ];

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  };

  const hexToRgb = (hex?: string) => {
    if (!hex) return null;
    
    // Remove the # if it exists
    hex = hex.replace(/^#/, '');
    
    let r, g, b;
    
    // Handle shorthand hex format (e.g. "#ABC")
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } 
    // Handle standard hex format (e.g. "#AABBCC")
    else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return null;
    }
    
    return { r, g, b };
  };

  // RGB color to hex conversion helper
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const interpolateColor = (
    start: { r: number; g: number; b: number },
    end: { r: number; g: number; b: number },
    factor: number
  ) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
  };

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
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0) return;
    if (!canvasRef.current) return; // 添加额外检查，防止null引用
    
    const ctx = context.current;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    // Adjust updateCount based on density
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05 * density));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (index < 0 || index >= letters.current.length) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();

      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        
        if (startRgb && endRgb) {
          letter.color = interpolateColor(
            startRgb,
            endRgb,
            letter.colorProgress
          );
          needsRedraw = true;
        }
      }
    });

    if (needsRedraw) {
      drawLetters();
    }
  };

  const animate = () => {
    const now = Date.now();
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = now;
    }

    if (smooth) {
      handleSmoothTransitions();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");
    if (!context.current) return;
    
    // 延迟初始化，确保DOM已完全加载
    const initTimeout = setTimeout(() => {
      resizeCanvas();
      animate();
    }, 50);

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
      clearTimeout(initTimeout);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [glitchSpeed, smooth, density, fontSize, mounted, binaryMode]);

  // 根据主题计算中心渐变的颜色
  const getVignetteColor = () => {
    // 确保使用当前主题
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

  // 整个组件的容器样式，包括渐变过渡
  const containerStyle = {
    opacity: opacity,
    transition: 'opacity 1s ease-in-out'
  };

  // 如果组件尚未挂载，返回一个空的占位符
  if (!mounted) {
    return <div className="relative w-full h-full bg-background"></div>;
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-background overflow-hidden"
      style={containerStyle}
    >
      <canvas ref={canvasRef} className="block w-full h-full opacity-80" />
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

export default CodeMatrixBackground;
