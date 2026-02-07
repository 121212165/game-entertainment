import React, { useRef, useEffect } from 'react';
import { Environment, GeneticImprint, OrganismType, TerrainType } from '../types';

interface CanvasWorldProps {
  environment: Environment;
  cellSize?: number;
  onCellHover?: (x: number, y: number) => void;
}

export const CanvasWorld: React.FC<CanvasWorldProps> = ({
  environment,
  cellSize = 12,
  onCellHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 初始化 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 大小
    canvas.width = environment.width * cellSize;
    canvas.height = environment.height * cellSize;

    // 绘制网格
    render(ctx);
  }, [environment, cellSize]);

  // 当环境更新时重新绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    render(ctx);
  }, [environment.organisms, environment.grid, cellSize]);

  // 处理鼠标悬停
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellHover) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && x < environment.width && y >= 0 && y < environment.height) {
      onCellHover(x, y);
    }
  };

  // 渲染函数
  const render = (ctx: CanvasRenderingContext2D) => {
    // 清空画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 绘制地形
    for (let y = 0; y < environment.height; y++) {
      for (let x = 0; x < environment.width; x++) {
        const terrain = environment.grid[y][x];
        drawTerrain(ctx, x, y, terrain.type, terrain.lightDust);
      }
    }

    // 绘制生物
    for (const organism of environment.organisms) {
      drawOrganism(ctx, organism);
    }

    // 绘制网格线
    drawGrid(ctx);
  };

  // 绘制地形
  const drawTerrain = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: TerrainType,
    lightDust: number
  ) => {
    const startX = x * cellSize;
    const startY = y * cellSize;

    // 根据地形类型设置颜色
    switch (type) {
      case TerrainType.PLAIN:
        ctx.fillStyle = `rgb(220, 200, 160)`;
        break;
      case TerrainType.FOREST:
        ctx.fillStyle = `rgb(80, 120, 80)`;
        break;
      case TerrainType.LIGHT_SPRING:
        ctx.fillStyle = `rgb(160, 200, 255)`;
        break;
    }

    // 绘制单元格
    ctx.fillRect(startX, startY, cellSize, cellSize);

    // 绘制光尘（半透明叠加）
    if (lightDust > 0) {
      const intensity = Math.min(lightDust / 100, 1);
      ctx.fillStyle = `rgba(255, 255, 200, ${intensity * 0.5})`;
      ctx.fillRect(startX, startY, cellSize, cellSize);
    }
  };

  // 绘制生物
  const drawOrganism = (ctx: CanvasRenderingContext2D, organism: any) => {
    const x = organism.position.x * cellSize + cellSize / 2;
    const y = organism.position.y * cellSize + cellSize / 2;
    const radius = cellSize * 0.4;

    if (organism.type === OrganismType.GLIMMER) {
      // 绘制 Glimmer
      ctx.beginPath();
      
      // 如果是森林之子，使用绿色渐变
      if (organism.geneticImprints.includes(GeneticImprint.FOREST_CHILD)) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgb(100, 255, 150)');
        gradient.addColorStop(1, 'rgb(50, 200, 100)');
        ctx.fillStyle = gradient;
      } else {
        // 普通 Glimmer，使用黄色渐变
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgb(255, 255, 150)');
        gradient.addColorStop(1, 'rgb(255, 200, 50)');
        ctx.fillStyle = gradient;
      }
      
      // 绘制圆形
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (organism.type === OrganismType.GLOOMER) {
      // 绘制 Gloomer
      ctx.beginPath();
      
      // 如果是狂暴模式，使用红色渐变
      if (organism.isFeral) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgb(255, 100, 100)');
        gradient.addColorStop(1, 'rgb(200, 50, 50)');
        ctx.fillStyle = gradient;
      } else {
        // 普通 Gloomer，使用紫色渐变
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgb(150, 100, 255)');
        gradient.addColorStop(1, 'rgb(100, 50, 200)');
        ctx.fillStyle = gradient;
      }
      
      // 绘制菱形
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x + radius, y);
      ctx.lineTo(x, y + radius);
      ctx.lineTo(x - radius, y);
      ctx.closePath();
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // 绘制网格线
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;

    // 绘制垂直线
    for (let x = 0; x <= environment.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, environment.height * cellSize);
      ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= environment.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(environment.width * cellSize, y * cellSize);
      ctx.stroke();
    }
  };

  return (
    <div className="relative inline-block bg-gray-100 border border-gray-300 rounded-lg shadow-md overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="cursor-crosshair"
      />
    </div>
  );
};
