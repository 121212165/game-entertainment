// 坐标类型
export interface Coordinates {
  x: number;
  y: number;
}

// 地形类型
export enum TerrainType {
  PLAIN = 'PLAIN',
  FOREST = 'FOREST',
  LIGHT_SPRING = 'LIGHT_SPRING',
}

// 地形属性
export interface Terrain {
  type: TerrainType;
  lightDust: number;
}

// 生物类型
export enum OrganismType {
  GLIMMER = 'GLIMMER',
  GLOOMER = 'GLOOMER',
}

// 生物状态
export interface OrganismState {
  energy: number;
  age: number;
  maxAge: number;
  speed: number;
  visionRange: number;
}

// Glimmer 状态枚举
export enum GlimmerState {
  IDLE = 'IDLE',           // 空闲休息
  FORAGING = 'FORAGING',   // 觅食
  FLEEING = 'FLEEING',     // 逃跑
  REPRODUCING = 'REPRODUCING', // 繁殖
  SOCIALIZING = 'SOCIALIZING', // 群聚
}

// Gloomer 状态枚举
export enum GloomerState {
  PATROLLING = 'PATROLLING', // 巡逻
  CHASING = 'CHASING',       // 追逐
  AMBUSHING = 'AMBUSHING',   // 伏击
  RESTING = 'RESTING',       // 休眠
  STARVING = 'STARVING',     // 饥饿危机
}

// 记忆信息
export interface Memory {
  position: Coordinates;
  value: number;  // 价值（正=食物，负=威胁）
  timestamp: number;  // 记忆时间
}

// 生物遗传印记
export enum GeneticImprint {
  FOREST_CHILD = 'FOREST_CHILD',
  SWIFT = 'SWIFT',              // 敏捷（速度+20%）
  VIGILANT = 'VIGILANT',        // 警觉（视野+30%）
  EFFICIENT = 'EFFICIENT',      // 高效（能量消耗-20%）
  SOCIAL = 'SOCIAL',            // 社交（群聚范围+50%）
}

// 生物接口
export interface Organism {
  id: string;
  type: OrganismType;
  position: Coordinates;
  state: OrganismState;
  geneticImprints: GeneticImprint[];
  update(environment: Environment): void;
  reproduce(environment: Environment): Organism | null;
}

// Glimmer 特定属性
export interface Glimmer extends Organism {
  blinkCooldown: number;
  blinkTimer: number;
  currentState: GlimmerState;
  memories: Memory[];
  socialRange: number;
  reproductionCooldown: number;
}

// Gloomer 特定属性
export interface Gloomer extends Organism {
  currentState: GloomerState;
  hunger: number;
  memories: Memory[];
  ambushTimer: number;
  targetId: string | null;
  patrolAngle: number;  // 巡逻方向
}

// 环境接口
export interface Environment {
  grid: Terrain[][];
  width: number;
  height: number;
  organisms: Organism[];
  version: number;
  update(): void;
  addOrganism(organism: Organism): void;
  removeOrganism(id: string): void;
  getTerrain(position: Coordinates): Terrain;
  getSafeTerrain(position: Coordinates): Terrain | null;
  getOrganismsAt(position: Coordinates): Organism[];
  getNearbyOrganisms(position: Coordinates, range: number): Organism[];
  getValidMoves(position: Coordinates, speed: number): Coordinates[];
  consumeLightDust(position: Coordinates, amount: number): void;
}

// 模拟状态
export interface SimulationState {
  isRunning: boolean;
  speed: number;
  stepCount: number;
}

// 种群统计数据
export interface PopulationData {
  step: number;
  glimmerCount: number;
  forestGlimmerCount: number;
  gloomerCount: number;
  lightDustTotal: number;
}

// 属性演化数据
export interface EvolutionData {
  step: number;
  averageGlimmerSpeed: number;
  averageGlimmerVision: number;
  averageGloomerSpeed: number;
  averageGloomerVision: number;
}
