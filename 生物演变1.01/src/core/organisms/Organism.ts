import { Coordinates, Environment, GeneticImprint, Organism as OrganismInterface, OrganismState, OrganismType, TerrainType, Memory } from '../../types';

export abstract class Organism implements OrganismInterface {
  public id: string;
  public type: OrganismType;
  public position: Coordinates;
  public state: OrganismState;
  public geneticImprints: GeneticImprint[];
  public memories: Memory[] = [];

  protected reproductionCost: number;
  protected baseEnergyConsumption: number;
  protected maxMemories: number = 10;
  protected memoryDecay: number = 50;  // 记忆衰减步数

  constructor(
    type: OrganismType,
    position: Coordinates,
    initialState: Partial<OrganismState> = {},
    geneticImprints: GeneticImprint[] = []
  ) {
    this.type = type;
    this.id = this.generateId();
    this.position = { ...position };
    this.geneticImprints = [...geneticImprints];

    this.state = {
      energy: initialState.energy || 50,
      age: initialState.age || 0,
      maxAge: initialState.maxAge || 100,
      speed: initialState.speed || 1,
      visionRange: initialState.visionRange || 5,
    };

    this.reproductionCost = 30;
    this.baseEnergyConsumption = 1;
  }

  // 生成唯一 ID
  private generateId(): string {
    return `${this.type.toLowerCase()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // 抽象方法：更新生物状态
  abstract update(environment: Environment): void;

  // 抽象方法：繁殖
  abstract reproduce(environment: Environment): OrganismInterface | null;

  // 移动
  protected move(newPosition: Coordinates, environment: Environment): void {
    const isValid = newPosition.x >= 0 && newPosition.x < environment.width &&
                   newPosition.y >= 0 && newPosition.y < environment.height;

    if (isValid) {
      this.position = { ...newPosition };
      this.consumeEnergy(environment);
    }
  }

  // 消耗能量
  protected consumeEnergy(environment: Environment): void {
    let energyCost = this.baseEnergyConsumption;

    // 地形影响
    const terrain = environment.getTerrain(this.position);
    if (terrain.type === TerrainType.FOREST && !this.geneticImprints.includes(GeneticImprint.FOREST_CHILD)) {
      energyCost += 1;  // 森林额外消耗
    }

    // 遗传印记影响
    if (this.geneticImprints.includes(GeneticImprint.EFFICIENT)) {
      energyCost *= 0.8;  // 高效印记减少20%消耗
    }

    this.state.energy -= energyCost;
  }

  // 添加记忆
  protected addMemory(position: Coordinates, value: number, currentTime: number): void {
    // 检查是否已有相近位置的记忆
    const existingIndex = this.memories.findIndex(m =>
      Math.abs(m.position.x - position.x) <= 2 &&
      Math.abs(m.position.y - position.y) <= 2
    );

    if (existingIndex >= 0) {
      // 更新现有记忆
      this.memories[existingIndex] = { position, value, timestamp: currentTime };
    } else {
      // 添加新记忆
      this.memories.push({ position, value, timestamp: currentTime });

      // 限制记忆数量
      if (this.memories.length > this.maxMemories) {
        // 移除最旧或价值最低的记忆
        this.memories.sort((a, b) => {
          const timeDiff = b.timestamp - a.timestamp;
          if (timeDiff > this.memoryDecay) return -1;
          return Math.abs(b.value) - Math.abs(a.value);
        });
        this.memories = this.memories.slice(0, this.maxMemories);
      }
    }
  }

  // 获取有价值的记忆
  protected getValuableMemories(currentTime: number, minValue: number = 10): Memory[] {
    return this.memories.filter(m => {
      const age = currentTime - m.timestamp;
      return age < this.memoryDecay && Math.abs(m.value) >= minValue;
    });
  }

  // 基因突变
  protected mutate(): void {
    // 速度突变（±10%）
    if (Math.random() < 0.1) {
      this.state.speed = Math.max(0.5, this.state.speed * (0.9 + Math.random() * 0.2));
    }

    // 视野突变（±10%）
    if (Math.random() < 0.1) {
      this.state.visionRange = Math.max(2, this.state.visionRange * (0.9 + Math.random() * 0.2));
    }

    // 遗传印记突变（小概率获得新印记）
    if (Math.random() < 0.02) {
      const allImprints = [
        GeneticImprint.SWIFT,
        GeneticImprint.VIGILANT,
        GeneticImprint.EFFICIENT,
        GeneticImprint.SOCIAL
      ];
      const newImprint = allImprints[Math.floor(Math.random() * allImprints.length)];
      if (!this.geneticImprints.includes(newImprint)) {
        this.geneticImprints.push(newImprint);
      }
    }
  }

  // 检查是否可以繁殖
  protected canReproduce(): boolean {
    return this.state.energy > this.reproductionCost * 2 && this.state.age > 10;
  }

  // 获取遗传印记给后代
  protected getOffspringImprints(environment: Environment): GeneticImprint[] {
    const imprints = [...this.geneticImprints];
    const terrain = environment.getTerrain(this.position);

    // 如果在森林中繁殖，后代获得森林之子印记
    if (terrain.type === TerrainType.FOREST && !imprints.includes(GeneticImprint.FOREST_CHILD)) {
      imprints.push(GeneticImprint.FOREST_CHILD);
    }

    return imprints;
  }

  // 计算与另一个位置的距离
  protected distanceTo(pos: Coordinates): number {
    return Math.abs(this.position.x - pos.x) + Math.abs(this.position.y - pos.y);
  }
}
