import { Coordinates, Environment as EnvironmentInterface, GeneticImprint, Organism, OrganismType, Terrain, TerrainType } from '../../types';
import { Glimmer } from '../organisms/Glimmer';
import { Gloomer } from '../organisms/Gloomer';

export class Environment implements EnvironmentInterface {
  public grid: Terrain[][];
  public width: number;
  public height: number;
  public organisms: Organism[] = [];
  public version: number = 0;

  constructor(width: number = 50, height: number = 50) {
    this.width = width;
    this.height = height;
    this.grid = this.generateTerrain();
  }

  // 地形生成
  private generateTerrain(): Terrain[][] {
    const grid: Terrain[][] = [];
    
    for (let y = 0; y < this.height; y++) {
      const row: Terrain[] = [];
      for (let x = 0; x < this.width; x++) {
        let type: TerrainType;
        const rand = Math.random();
        
        // 10% 概率生成光泉
        if (rand < 0.1) {
          type = TerrainType.LIGHT_SPRING;
        } 
        // 30% 概率生成森林
        else if (rand < 0.4) {
          type = TerrainType.FOREST;
        } 
        // 60% 概率生成平原
        else {
          type = TerrainType.PLAIN;
        }
        
        row.push({
          type,
          lightDust: this.getInitialLightDust(type),
        });
      }
      grid.push(row);
    }
    
    return grid;
  }

  // 获取初始光尘量
  private getInitialLightDust(type: TerrainType): number {
    switch (type) {
      case TerrainType.LIGHT_SPRING:
        return 100;
      case TerrainType.FOREST:
        return 30;
      case TerrainType.PLAIN:
        return 50;
      default:
        return 50;
    }
  }

  // 资源再生
  private regenerateResources(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const terrain = this.grid[y][x];
        
        // 根据地形类型再生光尘
        let regenerationRate = 0;
        switch (terrain.type) {
          case TerrainType.LIGHT_SPRING:
            regenerationRate = 5;
            break;
          case TerrainType.FOREST:
            regenerationRate = 2;
            break;
          case TerrainType.PLAIN:
            regenerationRate = 3;
            break;
        }
        
        terrain.lightDust = Math.min(100, terrain.lightDust + regenerationRate);
      }
    }
  }

  // 森林生成新的 Glimmer（返回新生成的 Glimmer 数组）
  private generateGlimmerInForest(): Glimmer[] {
    const newGlimmers: Glimmer[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const terrain = this.grid[y][x];
        // 如果是森林且光尘充足，有概率生成新的 Glimmer
        if (terrain.type === TerrainType.FOREST && terrain.lightDust > 80) {
          if (Math.random() < 0.01) { // 1% 概率
            newGlimmers.push(new Glimmer({ x, y }));
            terrain.lightDust -= 50; // 消耗光尘
          }
        }
      }
    }

    return newGlimmers;
  }

  // 更新环境
  update(): void {
    // 资源再生
    this.regenerateResources();

    // 收集需要移除的 ID 和需要添加的后代
    const deadIds = new Set<string>();
    const newOffspring: Organism[] = [];

    // 森林生成新的 Glimmer
    const forestGlimmers = this.generateGlimmerInForest();
    newOffspring.push(...forestGlimmers);

    // 更新所有生物
    for (const organism of this.organisms) {
      organism.update(this);

      // 检查生物是否死亡
      if (organism.state.energy <= 0 || organism.state.age >= organism.state.maxAge) {
        deadIds.add(organism.id);
      } else {
        // 尝试繁殖
        const offspring = organism.reproduce(this);
        if (offspring) {
          newOffspring.push(offspring);
        }
      }
    }

    // 批量移除死亡生物
    if (deadIds.size > 0) {
      this.organisms = this.organisms.filter(organism => !deadIds.has(organism.id));
    }

    // 批量添加新生物
    this.organisms.push(...newOffspring);

    // 递增版本号以触发 React 重新渲染
    this.version++;
  }

  // 添加生物
  addOrganism(organism: Organism): void {
    this.organisms.push(organism);
  }

  // 移除生物
  removeOrganism(id: string): void {
    this.organisms = this.organisms.filter(organism => organism.id !== id);
  }

  // 获取指定位置的地形
  getTerrain(position: Coordinates): Terrain {
    const { x, y } = position;
    if (this.isValidPosition(position)) {
      return this.grid[y][x];
    }
    throw new Error(`Invalid position: (${x}, ${y})`);
  }

  // 检查位置是否有效
  private isValidPosition(position: Coordinates): boolean {
    return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height;
  }

  // 获取指定位置的地形（安全版本，不抛出错误）
  public getSafeTerrain(position: Coordinates): Terrain | null {
    if (this.isValidPosition(position)) {
      return this.grid[position.y][position.x];
    }
    return null;
  }

  // 获取指定位置的生物
  getOrganismsAt(position: Coordinates): Organism[] {
    return this.organisms.filter(organism => 
      organism.position.x === position.x && organism.position.y === position.y
    );
  }

  // 获取指定范围内的生物
  getNearbyOrganisms(position: Coordinates, range: number): Organism[] {
    return this.organisms.filter(organism => {
      const distance = Math.abs(organism.position.x - position.x) + Math.abs(organism.position.y - position.y);
      return distance <= range;
    });
  }

  // 获取有效移动位置
  getValidMoves(position: Coordinates, speed: number): Coordinates[] {
    const moves: Coordinates[] = [];
    
    // 尝试向八个方向移动
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: -1 }, // 右上
      { dx: 1, dy: 1 },  // 右下
      { dx: -1, dy: 1 }, // 左下
      { dx: -1, dy: -1 }, // 左上
    ];
    
    for (const dir of directions) {
      // 将计算出的坐标四舍五入为整数
      let newX = Math.round(position.x + dir.dx * speed);
      let newY = Math.round(position.y + dir.dy * speed);
      
      // 确保坐标在有效范围内
      newX = Math.max(0, Math.min(this.width - 1, newX));
      newY = Math.max(0, Math.min(this.height - 1, newY));
      
      const newPosition = { x: newX, y: newY };
      
      // 确保位置有效且不重复
      if (this.isValidPosition(newPosition) && 
          !moves.some(move => move.x === newX && move.y === newY)) {
        moves.push(newPosition);
      }
    }
    
    return moves;
  }

  // 消耗光尘
  consumeLightDust(position: Coordinates, amount: number): void {
    if (this.isValidPosition(position)) {
      this.grid[position.y][position.x].lightDust = Math.max(0, this.grid[position.y][position.x].lightDust - amount);
    }
  }
}
