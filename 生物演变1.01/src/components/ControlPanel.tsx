import React from 'react';
import { Button } from '../../components/ui/button';
import { Slider } from '../../components/ui/slider';
import { SimulationState } from '../types';

interface ControlPanelProps {
  simulationState: SimulationState;
  onToggleRunning: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  simulationState,
  onToggleRunning,
  onStep,
  onReset,
  onSpeedChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">控制面板</h3>
      
      {/* 基本控制按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onToggleRunning} 
          className={`flex-1 min-w-[100px] ${simulationState.isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {simulationState.isRunning ? '暂停' : '继续'}
        </Button>
        
        <Button 
          onClick={onStep} 
          className="flex-1 min-w-[100px] bg-blue-500 hover:bg-blue-600"
        >
          单步执行
        </Button>
        
        <Button 
          onClick={onReset} 
          className="flex-1 min-w-[100px] bg-red-500 hover:bg-red-600"
        >
          重置世界
        </Button>
      </div>
      
      {/* 模拟速度调节 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">模拟速度</span>
          <span className="text-sm font-semibold text-gray-800">{simulationState.speed}x</span>
        </div>
        <Slider
          value={[simulationState.speed]}
          min={1}
          max={10}
          step={1}
          onValueChange={(value) => onSpeedChange(value[0])}
          className="w-full"
        />
      </div>
      
      {/* 模拟状态信息 */}
      <div className="pt-2 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600">当前状态：</span>
            <span className={`font-semibold ${simulationState.isRunning ? 'text-green-600' : 'text-yellow-600'}`}>
              {simulationState.isRunning ? '运行中' : '已暂停'}
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600">当前步数：</span>
            <span className="font-semibold text-gray-800">{simulationState.stepCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
