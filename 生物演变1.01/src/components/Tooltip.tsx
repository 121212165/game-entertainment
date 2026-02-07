import React from 'react';
import { Environment, GeneticImprint, Organism, OrganismType, GlimmerState, GloomerState } from '../types';

// 扩展类型以包含特定生物的属性
interface ExtendedOrganism extends Organism {
  currentState?: GlimmerState | GloomerState;
  blinkTimer?: number;
  hunger?: number;
  memories?: any[];
  socialRange?: number;
  reproductionCooldown?: number;
}

interface TooltipProps {
  environment: Environment;
  hoverPosition: { x: number; y: number } | null;
}

export const TooltipComponent: React.FC<TooltipProps> = ({ environment, hoverPosition }) => {
  if (!hoverPosition) return null;

  const { x, y } = hoverPosition;
  if (x < 0 || x >= environment.width || y < 0 || y >= environment.height) {
    return null;
  }

  const terrain = environment.grid[y][x];
  const organisms = environment.getOrganismsAt({ x, y }) as ExtendedOrganism[];

  // 地形类型中文映射
  const terrainTypeMap: Record<string, string> = {
    PLAIN: '平原',
    FOREST: '森林',
    LIGHT_SPRING: '光泉',
  };

  // 生物类型中文映射
  const organismTypeMap: Record<OrganismType, string> = {
    [OrganismType.GLIMMER]: '光能体',
    [OrganismType.GLOOMER]: '暗影体',
  };

  // Glimmer 状态中文映射
  const glimmerStateMap: Record<GlimmerState, string> = {
    [GlimmerState.IDLE]: '休息',
    [GlimmerState.FORAGING]: '觅食',
    [GlimmerState.FLEEING]: '逃跑',
    [GlimmerState.REPRODUCING]: '繁殖',
    [GlimmerState.SOCIALIZING]: '群聚',
  };

  // Gloomer 状态中文映射
  const gloomerStateMap: Record<GloomerState, string> = {
    [GloomerState.PATROLLING]: '巡逻',
    [GloomerState.CHASING]: '追逐',
    [GloomerState.AMBUSHING]: '伏击',
    [GloomerState.RESTING]: '休眠',
    [GloomerState.STARVING]: '饥饿',
  };

  // 遗传印记中文映射
  const imprintMap: Record<string, string> = {
    FOREST_CHILD: '森林之子',
    SWIFT: '敏捷',
    VIGILANT: '警觉',
    EFFICIENT: '高效',
    SOCIAL: '社交',
  };

  return (
    <div className="absolute bg-white p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-10 text-sm max-w-xs">
      <h4 className="font-semibold text-gray-800 mb-2">位置: ({x}, {y})</h4>

      {/* 地形信息 */}
      <div className="mb-2">
        <div className="font-medium text-gray-700">地形: {terrainTypeMap[terrain.type]}</div>
        <div className="text-gray-600">光尘: {terrain.lightDust.toFixed(1)}</div>
      </div>

      {/* 生物信息 */}
      {organisms.length > 0 ? (
        <div className="mt-2 space-y-2">
          <div className="font-medium text-gray-700">生物 ({organisms.length}):</div>
          {organisms.map((organism, index) => (
            <div key={organism.id} className="p-2 bg-gray-50 rounded">
              <div className="font-semibold text-gray-800">
                {organismTypeMap[organism.type]} {index + 1}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                <div className="text-gray-600">能量: {organism.state.energy.toFixed(1)}</div>
                <div className="text-gray-600">年龄: {organism.state.age}</div>
                <div className="text-gray-600">速度: {organism.state.speed.toFixed(1)}</div>
                <div className="text-gray-600">视野: {organism.state.visionRange.toFixed(1)}</div>

                {/* 当前状态 */}
                {organism.currentState && (
                  <div className="text-gray-600">
                    状态: {organism.type === OrganismType.GLIMMER
                      ? glimmerStateMap[organism.currentState as GlimmerState]
                      : gloomerStateMap[organism.currentState as GloomerState]}
                  </div>
                )}

                {/* 记忆数量 */}
                {organism.memories && (
                  <div className="text-gray-600">记忆: {organism.memories.length}</div>
                )}

                {/* Glimmer 特定属性 */}
                {organism.type === OrganismType.GLIMMER && (
                  <>
                    {organism.blinkTimer !== undefined && (
                      <div className="text-gray-600">闪烁冷却: {organism.blinkTimer}</div>
                    )}
                    {organism.socialRange !== undefined && (
                      <div className="text-gray-600">社交范围: {organism.socialRange.toFixed(1)}</div>
                    )}
                    {organism.reproductionCooldown !== undefined && (
                      <div className="text-gray-600">繁殖冷却: {organism.reproductionCooldown}</div>
                    )}
                    <div className="text-gray-600 col-span-2">
                      印记: {organism.geneticImprints.length > 0 ?
                        organism.geneticImprints.map(imprint => imprintMap[imprint]).join(', ') :
                        '无'
                      }
                    </div>
                  </>
                )}

                {/* Gloomer 特定属性 */}
                {organism.type === OrganismType.GLOOMER && (
                  <>
                    <div className="text-gray-600">饥饿度: {organism.hunger ?? 0}</div>
                    <div className="text-gray-600 col-span-2">
                      印记: {organism.geneticImprints.length > 0 ?
                        organism.geneticImprints.map(imprint => imprintMap[imprint]).join(', ') :
                        '无'
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-600 mt-2">无生物</div>
      )}
    </div>
  );
};
