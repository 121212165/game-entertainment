import { Coordinates, Environment, OrganismType, TerrainType, GloomerState, Glimmer } from '../../types';
import { Organism } from './Organism';

export class Gloomer extends Organism {
  public currentState: GloomerState;
  public hunger: number;
  public ambushTimer: number;
  public targetId: string | null;
  public patrolAngle: number;

  constructor(position: Coordinates) {
    super(OrganismType.GLOOMER, position, {
      energy: 80,
      maxAge: 120,
      speed: 2.0,
      visionRange: 8,
    }, []);

    this.currentState = GloomerState.PATROLLING;
    this.hunger = 0;
    this.ambushTimer = 0;
    this.targetId = null;
    this.patrolAngle = Math.random() * Math.PI * 2;

    this.reproductionCost = 40;
    this.baseEnergyConsumption = 2;
  }

  // 更新 Gloomer 状态
  update(environment: Environment): void {
    this.state.age++;
    this.hunger++;

    // 更新伏击计时器
    if (this.ambushTimer > 0) {
      this.ambushTimer--;
    }

    // 状态机决策
    this.decideState(environment);

    // 根据状态执行行为
    switch (this.currentState) {
      case GloomerState.STARVING:
        this.executeStarving(environment);
        break;
      case GloomerState.CHASING:
        this.executeChasing(environment);
        break;
      case GloomerState.AMBUSHING:
        this.executeAmbushing(environment);
        break;
      case GloomerState.PATROLLING:
        this.executePatrolling(environment);
        break;
      case GloomerState.RESTING:
      default:
        this.executeResting(environment);
        break;
    }

    // 消耗基础能量
    this.consumeEnergy(environment);
  }

  // 状态决策（行为优先级：饥饿危机 > 追逐 > 伏击 > 巡逻 > 休息）
  private decideState(environment: Environment): void {
    // 1. 检查是否饥饿危机
    if (this.state.energy < 20 || this.hunger > 50) {
      this.currentState = GloomerState.STARVING;
      return;
    }

    // 2. 检查视野内的猎物
    const nearbyPrey = this.detectPrey(environment);
    if (nearbyPrey.length > 0) {
      this.currentState = GloomerState.CHASING;
      this.targetId = nearbyPrey[0].id;
      return;
    }

    // 3. 检查记忆中的猎物位置
    const preyMemories = this.getValuableMemories(environment.version, 50);
    if (preyMemories.length > 0 && this.ambushTimer === 0) {
      // 检查记忆位置附近是否有适合伏击的地形
      const bestMemory = this.findBestAmbushSpot(environment, preyMemories);
      if (bestMemory) {
        this.currentState = GloomerState.AMBUSHING;
        return;
      }
    }

    // 4. 能量充足时巡逻
    if (this.state.energy > 60) {
      this.currentState = GloomerState.PATROLLING;
      return;
    }

    // 5. 默认休息
    this.currentState = GloomerState.RESTING;
  }

  // 检测猎物
  private detectPrey(environment: Environment): Glimmer[] {
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.state.visionRange);
    const prey = nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER) as Glimmer[];

    // 森林中的伏击：视野减少但不易被发现
    const currentTerrain = environment.getTerrain(this.position);
    if (currentTerrain.type === TerrainType.FOREST) {
      return prey;  // 在森林中可以看到全部猎物（伏击优势）
    }

    return prey;
  }

  // 执行饥饿危机行为（急躁地寻找食物）
  private executeStarving(environment: Environment): void {
    // 视野扩大但速度降低
    const desperateVision = this.state.visionRange * 1.5;
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, desperateVision);
    const prey = nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER);

    if (prey.length > 0) {
      // 找到最近的猎物
      let closestPrey = prey[0];
      let minDistance = this.distanceTo(closestPrey.position);

      for (const p of prey) {
        const dist = this.distanceTo(p.position);
        if (dist < minDistance) {
          minDistance = dist;
          closestPrey = p;
        }
      }

      // 全力追捕
      this.chaseTarget(environment, closestPrey.position, this.state.speed * 1.2);

      // 尝试捕食
      if (minDistance <= 1.5) {
        this.consumePrey(environment, closestPrey as Glimmer);
      }
    } else {
      // 没有猎物，随机移动寻找
      this.wanderDesperately(environment);
    }

    // 饥饿危机状态下能量消耗加倍
    this.state.energy -= this.baseEnergyConsumption;
  }

  // 执行追逐行为
  private executeChasing(environment: Environment): void {
    if (!this.targetId) {
      this.currentState = GloomerState.PATROLLING;
      return;
    }

    // 找到目标猎物
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.state.visionRange);
    const target = nearbyOrganisms.find(org => org.id === this.targetId);

    if (!target || target.type !== OrganismType.GLIMMER) {
      // 目标丢失，检查记忆
      const preyMemories = this.getValuableMemories(environment.version, 50);
      if (preyMemories.length > 0) {
        this.moveToTarget(environment, preyMemories[0].position);
      } else {
        this.currentState = GloomerState.PATROLLING;
        this.targetId = null;
      }
      return;
    }

    const distance = this.distanceTo(target.position);

    // 记忆猎物位置
    this.addMemory(target.position, 100, environment.version);

    if (distance <= 1.5) {
      // 抓住了！
      this.consumePrey(environment, target as Glimmer);
      this.targetId = null;
    } else {
      // 继续追捕
      this.chaseTarget(environment, target.position, this.state.speed);

      // 预判猎物逃跑方向
      if (distance < this.state.visionRange * 0.5) {
        this.predictAndIntercept(environment, target);
      }
    }
  }

  // 追捕目标
  private chaseTarget(environment: Environment, targetPosition: Coordinates, speedMultiplier: number = 1): void {
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;

    let newX = this.position.x;
    let newY = this.position.y;

    const speed = this.state.speed * speedMultiplier;

    if (Math.abs(dx) > Math.abs(dy)) {
      newX += dx > 0 ? Math.min(speed, dx) : Math.max(-speed, dx);
    } else {
      newY += dy > 0 ? Math.min(speed, dy) : Math.max(-speed, dy);
    }

    newX = Math.max(0, Math.min(environment.width - 1, newX));
    newY = Math.max(0, Math.min(environment.height - 1, newY));

    this.move({ x: newX, y: newY }, environment);
  }

  // 预判并拦截猎物
  private predictAndIntercept(environment: Environment, prey: any): void {
    // 简单的预判：向猎物可能逃跑的方向移动
    const dx = prey.position.x - this.position.x;
    const dy = prey.position.y - this.position.y;

    // 猎物可能会向远离我们的方向逃跑
    const predictedX = prey.position.x + (dx > 0 ? 2 : -2);
    const predictedY = prey.position.y + (dy > 0 ? 2 : -2);

    // 尝试拦截
    const interceptChance = 0.3;  // 30% 概率尝试拦截
    if (Math.random() < interceptChance) {
      this.chaseTarget(environment, {
        x: Math.max(0, Math.min(environment.width - 1, predictedX)),
        y: Math.max(0, Math.min(environment.height - 1, predictedY))
      }, this.state.speed * 0.8);
    }
  }

  // 执行伏击行为
  private executeAmbushing(environment: Environment): void {
    const currentTerrain = environment.getTerrain(this.position);

    // 如果在森林中，降低能量消耗并等待
    if (currentTerrain.type === TerrainType.FOREST) {
      this.baseEnergyConsumption = 0.5;  // 伏击时能量消耗降低

      // 检查是否有猎物靠近
      const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.state.visionRange * 0.7);
      const prey = nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER);

      if (prey.length > 0) {
        // 发现猎物，发起攻击
        this.currentState = GloomerState.CHASING;
        this.targetId = prey[0].id;
        this.baseEnergyConsumption = 2;  // 恢复正常消耗
      } else {
        // 继续等待
        this.ambushTimer++;
        if (this.ambushTimer > 20) {
          // 等待太久，放弃伏击
          this.currentState = GloomerState.PATROLLING;
          this.baseEnergyConsumption = 2;
        }
      }
    } else {
      // 移动到森林伏击
      const ambushMemories = this.getValuableMemories(environment.version, 50);
      if (ambushMemories.length > 0) {
        this.moveToTarget(environment, ambushMemories[0].position);
      } else {
        // 寻找最近的森林
        this.moveToNearestForest(environment);
      }
    }
  }

  // 执行巡逻行为
  private executePatrolling(environment: Environment): void {
    // 检查是否有猎物出现
    const nearbyPrey = this.detectPrey(environment);
    if (nearbyPrey.length > 0) {
      this.currentState = GloomerState.CHASING;
      this.targetId = nearbyPrey[0].id;
      return;
    }

    // 沿着巡逻角度移动
    const moveDistance = this.state.speed;
    const newX = Math.round(this.position.x + Math.cos(this.patrolAngle) * moveDistance);
    const newY = Math.round(this.position.y + Math.sin(this.patrolAngle) * moveDistance);

    const validPosition = {
      x: Math.max(0, Math.min(environment.width - 1, newX)),
      y: Math.max(0, Math.min(environment.height - 1, newY))
    };

    this.move(validPosition, environment);

    // 缓慢改变巡逻方向
    this.patrolAngle += (Math.random() - 0.5) * 0.5;

    // 记忆探索过的区域
    this.addMemory(validPosition, 10, environment.version);
  }

  // 执行休息行为
  private executeResting(environment: Environment): void {
    // 降低能量消耗
    this.baseEnergyConsumption = 0.5;

    // 有概率检查周围
    if (Math.random() < 0.2) {
      const nearbyPrey = this.detectPrey(environment);
      if (nearbyPrey.length > 0) {
        this.currentState = GloomerState.CHASING;
        this.targetId = nearbyPrey[0].id;
        this.baseEnergyConsumption = 2;
      }
    }
  }

  // 绝望地徘徊
  private wanderDesperately(environment: Environment): void {
    const validMoves = environment.getValidMoves(this.position, this.state.speed * 0.5);
    if (validMoves.length > 0) {
      // 优先向可能有猎物的地方移动
      const preyMemories = this.getValuableMemories(environment.version, 30);
      if (preyMemories.length > 0) {
        this.moveToTarget(environment, preyMemories[0].position);
      } else {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.move(randomMove, environment);
      }
    }
  }

  // 移动到最近的森林
  private moveToNearestForest(environment: Environment): void {
    let nearestForest = this.position;
    let minDistance = Infinity;

    const searchRange = 10;
    for (let dy = -searchRange; dy <= searchRange; dy++) {
      for (let dx = -searchRange; dx <= searchRange; dx++) {
        const x = this.position.x + dx;
        const y = this.position.y + dy;

        if (x >= 0 && x < environment.width && y >= 0 && y < environment.height) {
          const terrain = environment.getSafeTerrain({ x, y });
          if (terrain && terrain.type === TerrainType.FOREST) {
            const dist = Math.abs(dx) + Math.abs(dy);
            if (dist < minDistance) {
              minDistance = dist;
              nearestForest = { x, y };
            }
          }
        }
      }
    }

    this.moveToTarget(environment, nearestForest);
  }

  // 找到最佳伏击位置
  private findBestAmbushSpot(environment: Environment, memories: any[]): { position: Coordinates } | null {
    let bestSpot = null;
    let bestScore = -Infinity;

    for (const memory of memories) {
      // 检查记忆位置附近是否有森林
      const searchRange = 5;
      for (let dy = -searchRange; dy <= searchRange; dy++) {
        for (let dx = -searchRange; dx <= searchRange; dx++) {
          const x = memory.position.x + dx;
          const y = memory.position.y + dy;

          if (x >= 0 && x < environment.width && y >= 0 && y < environment.height) {
            const terrain = environment.getSafeTerrain({ x, y });
            if (terrain && terrain.type === TerrainType.FOREST) {
              const distance = Math.abs(dx) + Math.abs(dy);
              let score = memory.value - distance;  // 价值高且距离近的位置更好
              if (score > bestScore) {
                bestScore = score;
                bestSpot = { position: { x, y } };
              }
            }
          }
        }
      }
    }

    return bestSpot;
  }

  // 移动到目标位置
  private moveToTarget(environment: Environment, target: Coordinates): void {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;

    let newX = this.position.x;
    let newY = this.position.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      newX += dx > 0 ? Math.min(this.state.speed, dx) : Math.max(-this.state.speed, dx);
    } else {
      newY += dy > 0 ? Math.min(this.state.speed, dy) : Math.max(-this.state.speed, dy);
    }

    newX = Math.max(0, Math.min(environment.width - 1, newX));
    newY = Math.max(0, Math.min(environment.height - 1, newY));

    this.move({ x: newX, y: newY }, environment);
  }

  // 捕食 Glimmer
  private consumePrey(environment: Environment, prey: Glimmer): void {
    environment.removeOrganism(prey.id);

    const energyGain = 50;
    this.state.energy = Math.min(100, this.state.energy + energyGain);
    this.hunger = 0;
    this.currentState = GloomerState.RESTING;

    // 移除被吃掉的猎物的记忆
    this.memories = this.memories.filter(m =>
      m.position.x !== prey.position.x || m.position.y !== prey.position.y
    );
  }

  // 繁殖
  reproduce(environment: Environment): Gloomer | null {
    if (!this.canReproduce()) return null;

    // Gloomer 需要高能量才能繁殖
    if (this.state.energy < 70) return null;

    this.state.energy -= this.reproductionCost;

    const offspringPosition: Coordinates = {
      x: Math.max(0, Math.min(environment.width - 1, this.position.x + (Math.random() > 0.5 ? 1 : -1))),
      y: Math.max(0, Math.min(environment.height - 1, this.position.y + (Math.random() > 0.5 ? 1 : -1))),
    };

    const offspring = new Gloomer(offspringPosition);

    // 继承部分记忆（主要是猎物位置）
    offspring.memories = this.memories
      .filter(m => m.value > 0)
      .slice(0, 5);

    offspring.mutate();
    return offspring;
  }
}
