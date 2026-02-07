import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PopulationData, EvolutionData } from '../types';

interface DataChartsProps {
  populationData: PopulationData[];
  evolutionData: EvolutionData[];
}

const MAX_DISPLAY_POINTS = 100;

export const DataCharts: React.FC<DataChartsProps> = ({ populationData, evolutionData }) => {
  // 使用 useMemo 缓存切片后的数据，避免每次渲染都重新切片
  const recentPopulationData = useMemo(
    () => populationData.slice(-MAX_DISPLAY_POINTS),
    [populationData]
  );
  const recentEvolutionData = useMemo(
    () => evolutionData.slice(-MAX_DISPLAY_POINTS),
    [evolutionData]
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 种群动态图表 */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">种群动态</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={recentPopulationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="step" 
              label={{ value: '步数', position: 'insideBottomRight', offset: -10 }} 
              stroke="#666"
            />
            <YAxis 
              label={{ value: '数量', angle: -90, position: 'insideLeft' }} 
              stroke="#666"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', border: '1px solid #ddd' }}
              formatter={(value) => [value, '数量']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="glimmerCount" 
              stackId="1" 
              stroke="#ffc107" 
              fill="#fff3cd" 
              name="普通光能体"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="forestGlimmerCount" 
              stackId="1" 
              stroke="#28a745" 
              fill="#d4edda" 
              name="森林之子"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="gloomerCount" 
              stackId="2" 
              stroke="#6f42c1" 
              fill="#e2d9f3" 
              name="暗影体"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 光尘总量图表 */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">光尘总量</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={recentPopulationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="step" 
              label={{ value: '步数', position: 'insideBottomRight', offset: -10 }} 
              stroke="#666"
            />
            <YAxis 
              label={{ value: '光尘总量', angle: -90, position: 'insideLeft' }} 
              stroke="#666"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', border: '1px solid #ddd' }}
              formatter={(value) => [value, '光尘']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="lightDustTotal" 
              stroke="#ffeb3b" 
              strokeWidth={2} 
              name="光尘总量"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 属性演化趋势图表 */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">属性演化趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={recentEvolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="step" 
              label={{ value: '步数', position: 'insideBottomRight', offset: -10 }} 
              stroke="#666"
            />
            <YAxis 
              label={{ value: '属性值', angle: -90, position: 'insideLeft' }} 
              stroke="#666"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="averageGlimmerSpeed" 
              stroke="#ff9800" 
              strokeWidth={2} 
              name="光能体平均速度"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="averageGlimmerVision" 
              stroke="#2196f3" 
              strokeWidth={2} 
              name="光能体平均视野"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="averageGloomerSpeed" 
              stroke="#9c27b0" 
              strokeWidth={2} 
              name="暗影体平均速度"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="averageGloomerVision" 
              stroke="#e91e63" 
              strokeWidth={2} 
              name="暗影体平均视野"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
