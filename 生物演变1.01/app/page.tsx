'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Environment } from '../src/core/environment/Environment';
import { Glimmer } from '../src/core/organisms/Glimmer';
import { Gloomer } from '../src/core/organisms/Gloomer';
import { CanvasWorld } from '../src/components/CanvasWorld';
import { ControlPanel } from '../src/components/ControlPanel';
import { DataCharts } from '../src/components/DataCharts';
import { TooltipComponent } from '../src/components/Tooltip';
import { SimulationState, PopulationData, EvolutionData, GeneticImprint } from '../src/types';

// 初始化环境的辅助函数
function initializeEnvironment(): Environment {
  const env = new Environment(50, 50);

  // 初始化一些 Glimmer
  for (let i = 0; i < 30; i++) {
    const position = {
      x: Math.floor(Math.random() * env.width),
      y: Math.floor(Math.random() * env.height),
    };
    env.addOrganism(new Glimmer(position));
  }

  // 初始化一些 Gloomer
  for (let i = 0; i < 5; i++) {
    const position = {
      x: Math.floor(Math.random() * env.width),
      y: Math.floor(Math.random() * env.height),
    };
    env.addOrganism(new Gloomer(position));
  }

  return env;
}

export default function Home() {
  // 初始化环境
  const initialEnvironment = useMemo(() => initializeEnvironment(), []);
  const [environment, setEnvironment] = useState<Environment>(initialEnvironment);
  // 使用 ref 存储环境实例，确保总是访问最新状态
  const environmentRef = useRef(initialEnvironment);
  environmentRef.current = environment;

  // 模拟状态
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    speed: 1,
    stepCount: 0,
  });

  // 数据收集
  const [populationData, setPopulationData] = useState<PopulationData[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);

  // 鼠标悬停位置
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // 更新统计数据
  const updateStats = useCallback(() => {
    const env = environmentRef.current;

    const glimmers = env.organisms.filter(org => org.type === 'GLIMMER');
    const forestGlimmers = glimmers.filter(glimmer =>
      glimmer.geneticImprints.includes(GeneticImprint.FOREST_CHILD)
    );
    const gloomers = env.organisms.filter(org => org.type === 'GLOOMER');

    // 计算总光尘
    let totalLightDust = 0;
    for (let y = 0; y < env.height; y++) {
      for (let x = 0; x < env.width; x++) {
        totalLightDust += env.grid[y][x].lightDust;
      }
    }

    // 种群数据
    const newPopulationData: PopulationData = {
      step: env.version,
      glimmerCount: glimmers.length - forestGlimmers.length,
      forestGlimmerCount: forestGlimmers.length,
      gloomerCount: gloomers.length,
      lightDustTotal: totalLightDust,
    };

    // 演化数据
    const newEvolutionData: EvolutionData = {
      step: env.version,
      averageGlimmerSpeed: glimmers.length > 0 ?
        glimmers.reduce((sum, g) => sum + g.state.speed, 0) / glimmers.length : 0,
      averageGlimmerVision: glimmers.length > 0 ?
        glimmers.reduce((sum, g) => sum + g.state.visionRange, 0) / glimmers.length : 0,
      averageGloomerSpeed: gloomers.length > 0 ?
        gloomers.reduce((sum, g) => sum + g.state.speed, 0) / gloomers.length : 0,
      averageGloomerVision: gloomers.length > 0 ?
        gloomers.reduce((sum, g) => sum + g.state.visionRange, 0) / gloomers.length : 0,
    };

    // 限制数据数组最大长度，防止内存泄漏
    const MAX_DATA_POINTS = 1000;
    setPopulationData(prev => {
      const updated = [...prev, newPopulationData];
      return updated.length > MAX_DATA_POINTS ? updated.slice(-MAX_DATA_POINTS) : updated;
    });
    setEvolutionData(prev => {
      const updated = [...prev, newEvolutionData];
      return updated.length > MAX_DATA_POINTS ? updated.slice(-MAX_DATA_POINTS) : updated;
    });
  }, []);

  // 执行一步模拟
  const stepSimulation = useCallback(() => {
    // 直接更新 ref 中的环境实例
    const env = environmentRef.current;
    env.update();

    // 更新状态以触发重新渲染
    setSimulationState(prev => ({
      ...prev,
      stepCount: prev.stepCount + 1,
    }));

    // 触发环境状态更新，保持类方法
    setEnvironment(env);

    // 更新统计数据
    updateStats();
  }, [updateStats]);

  // 模拟循环
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (simulationState.isRunning) {
      const delay = 1000 / simulationState.speed;
      interval = setInterval(stepSimulation, delay);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [simulationState.isRunning, simulationState.speed, stepSimulation]);

  // 切换运行状态
  const toggleRunning = () => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  // 重置模拟
  const resetSimulation = () => {
    setEnvironment(initializeEnvironment());
    setSimulationState({
      isRunning: false,
      speed: 1,
      stepCount: 0,
    });
    setPopulationData([]);
    setEvolutionData([]);
  };

  // 处理速度变化
  const handleSpeedChange = (speed: number) => {
    setSimulationState(prev => ({
      ...prev,
      speed,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            光与影：物种摇篮
          </h1>
          <p className="text-gray-600">
            人工生命演化模拟器 - 探索环境印记与遗传适应的奥秘
          </p>
        </header>
        
        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：Canvas 世界和控制面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Canvas 世界 */}
            <div className="relative">
              <CanvasWorld 
                environment={environment} 
                cellSize={12}
                onCellHover={(x, y) => setHoverPosition({ x, y })}
              />
              <TooltipComponent 
                environment={environment} 
                hoverPosition={hoverPosition}
              />
            </div>
            
            {/* 控制面板 */}
            <ControlPanel 
              simulationState={simulationState}
              onToggleRunning={toggleRunning}
              onStep={stepSimulation}
              onReset={resetSimulation}
              onSpeedChange={handleSpeedChange}
            />
          </div>
          
          {/* 右侧：数据可视化 */}
          <div className="space-y-6">
            <DataCharts 
              populationData={populationData}
              evolutionData={evolutionData}
            />
          </div>
        </div>
        
        {/* 页脚 */}
        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>基于 Next.js 15 + TypeScript 5 构建 | Canvas 渲染 | 实时数据可视化</p>
        </footer>
      </div>
    </div>
  );
}
