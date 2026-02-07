import { Coordinates, Environment, GeneticImprint, OrganismType, TerrainType, GlimmerState, Memory } from '../../types';
import { Organism } from './Organism';

export class Glimmer extends Organism {
  public blinkCooldown: number;
  public blinkTimer: number;
  public currentState: GlimmerState;
  public socialRange: number;
  public reproductionCooldown: number;

  constructor(position: Coordinates, geneticImprints: GeneticImprint[] = []) {
    super(OrganismType.GLIMMER, position, {
      energy: 50,
      maxAge: 80,
      speed: 1.5,
      visionRange: 6,
    }, geneticImprints);

    this.blinkCooldown = 20;
    this.blinkTimer = 0;
    this.currentState = GlimmerState.IDLE;
    this.socialRange = 4;
    this.reproductionCooldown = 0;

    // 应用遗传印记修正
    if (this.geneticImprints.includes(GeneticImprint.SWIFT)) {
      this.state.speed *= 1.2;
    }
    if (this.geneticImprints.includes(GeneticImprint.VIGILANT)) {
      this.state.visionRange *= 1.3;
    }
    if (this.geneticImprints.includes(GeneticImprint.SOCIAL)) {
      this.socialRange *= 1.5;
    }

    this.reproductionCost = 25;
    this.baseEnergyConsumption = 1;
  }

  // 更新 Glimmer 状态
  update(environment: Environment): void {
    this.state.age++;

    // 更新冷却时间
    if (this.blinkTimer > 0) this.blinkTimer--;
    if (this.reproductionCooldown > 0) this.reproductionCooldown--;

    // 状态机决策
    this.decideState(environment);

    // 根据状态执行行为
    switch (this.currentState) {
      case GlimmerState.FLEEING:
        this.executeFleeing(environment);
        break;
      case GlimmerState.REPRODUCING:
        this.executeReproducing(environment);
        break;
      case GlimmerState.FORAGING:
        this.executeForaging(environment);
        break;
      case GlimmerState.SOCIALIZING:
        this.executeSocializing(environment);
        break;
      case GlimmerState.IDLE:
      default:
        this.executeIdle(environment);
        break;
    }
  }

  // 状态决策（行为优先级：威胁 > 繁殖 > 觅食 > 群聚 > 休息）
  private decideState(environment: Environment): void {
    // 1. 检查威胁
    const threats = this.detectThreats(environment);
    if (threats.length > 0) {
      this.currentState = GlimmerState.FLEEING;
      return;
    }

    // 2. 检查是否可以繁殖
    if (this.canReproduce() && this.reproductionCooldown === 0 && this.state.energy > 60) {
      this.currentState = GlimmerState.REPRODUCING;
      return;
    }

    // 3. 检查能量水平决定是否觅食
    if (this.state.energy < 70) {
      this.currentState = GlimmerState.FORAGING;
      return;
    }

    // 4. 检查附近同伴
    const nearbyFriends = this.countNearbyFriends(environment);
    if (nearbyFriends < 3 && nearbyFriends > 0) {
      this.currentState = GlimmerState.SOCIALIZING;
      return;
    }

    // 5. 默认休息
    this.currentState = GlimmerState.IDLE;
  }

  // 检测威胁
  private detectThreats(environment: Environment): any[] {
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.state.visionRange);
    return nearbyOrganisms.filter(org => org.type === OrganismType.GLOOMER);
  }

  // 统计附近同伴
  private countNearbyFriends(environment: Environment): number {
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.socialRange);
    return nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER && org.id !== this.id).length;
  }

  // 执行逃跑行为
  private executeFleeing(environment: Environment): void {
    const threats = this.detectThreats(environment);
    if (threats.length === 0) {
      this.currentState = GlimmerState.IDLE;
      return;
    }

    // 找到最近的威胁
    let closestThreat = threats[0];
    let minDistance = this.distanceTo(closestThreat.position);

    for (const threat of threats) {
      const dist = this.distanceTo(threat.position);
      if (dist < minDistance) {
        minDistance = dist;
        closestThreat = threat;
      }
    }

    // 记忆威胁位置
    this.addMemory(closestThreat.position, -100, environment.version);

    // 根据距离决定逃跑策略
    if (minDistance <= 3 && this.blinkTimer === 0) {
      // 威胁很近，使用闪烁
      this.blinkToSafety(environment, closestThreat.position);
    } else {
      // 正常逃跑
      this.flee(environment, closestThreat.position);
    }
  }

  // 闪烁到安全位置
  private blinkToSafety(environment: Environment, threatPosition: Coordinates): void {
    const blinkCost = 15;
    if (this.state.energy < blinkCost) return;

    // 找到视野内最安全的位置
    const validMoves = environment.getValidMoves(this.position, this.state.visionRange);
    let safestPosition = this.position;
    let bestSafetyScore = -Infinity;

    for (const move of validMoves) {
      let score = this.distanceTo(threatPosition);  // 距离威胁越远越好

      const terrain = environment.getSafeTerrain(move);
      if (terrain) {
        if (terrain.type === TerrainType.FOREST) score += 10;  // 森林提供额外安全
        if (terrain.type === TerrainType.LIGHT_SPRING) score += 5;
        score += terrain.lightDust / 10;  // 光尘也提供一些价值
      }

      if (score > bestSafetyScore) {
        bestSafetyScore = score;
        safestPosition = move;
      }
    }

    if (safestPosition.x !== this.position.x || safestPosition.y !== this.position.y) {
      this.state.energy -= blinkCost;
      this.position = safestPosition;
      this.blinkTimer = this.blinkCooldown;
      this.consumeEnergy(environment);
    }
  }

  // 逃跑
  private flee(environment: Environment, threatPosition: Coordinates): void {
    const validMoves = environment.getValidMoves(this.position, this.state.speed);
    let bestPosition = this.position;
    let bestScore = this.distanceTo(threatPosition);

    for (const move of validMoves) {
      const distanceFromThreat = Math.abs(move.x - threatPosition.x) + Math.abs(move.y - threatPosition.y);

      // 优先远离威胁
      let score = distanceFromThreat * 2;

      const terrain = environment.getSafeTerrain(move);
      if (terrain) {
        if (terrain.type === TerrainType.FOREST) score += 10;
        if (terrain.type === TerrainType.LIGHT_SPRING) score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPosition = move;
      }
    }

    this.move(bestPosition, environment);
  }

  // 执行觅食行为
  private executeForaging(environment: Environment): void {
    // 先检查当前位置是否有光尘
    const currentTerrain = environment.getTerrain(this.position);
    if (currentTerrain.lightDust > 0) {
      const eatAmount = Math.min(20, currentTerrain.lightDust);
      this.state.energy = Math.min(100, this.state.energy + eatAmount);
      environment.consumeLightDust(this.position, eatAmount);
      return;
    }

    // 检查记忆中的食物位置
    const foodMemories = this.getValuableMemories(environment.version, 30);
    if (foodMemories.length > 0) {
      // 去最近的记忆中的食物位置
      foodMemories.sort((a, b) => this.distanceTo(a.position) - this.distanceTo(b.position));
      this.moveToTarget(environment, foodMemories[0].position);
      return;
    }

    // 寻找视野内光尘最多的位置
    const validMoves = environment.getValidMoves(this.position, this.state.speed);
    let bestPosition = this.position;
    let maxLightDust = 0;

    for (const move of validMoves) {
      const terrain = environment.getSafeTerrain(move);
      if (terrain && terrain.lightDust > maxLightDust) {
        maxLightDust = terrain.lightDust;

        // 根据地形类型调整优先级
        let priority = terrain.lightDust;
        if (terrain.type === TerrainType.LIGHT_SPRING) priority += 50;
        if (terrain.type === TerrainType.FOREST) priority += 20;

        if (priority > maxLightDust) {
          maxLightDust = priority;
          bestPosition = move;
        }
      }
    }

    // 记忆发现的高光尘位置
    if (maxLightDust > 30) {
      this.addMemory(bestPosition, maxLightDust, environment.version);
    }

    if (bestPosition.x !== this.position.x || bestPosition.y !== this.position.y) {
      this.move(bestPosition, environment);
    } else {
      // 随机探索
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.move(randomMove, environment);
      }
    }
  }

  // 执行群聚行为
  private executeSocializing(environment: Environment): void {
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.socialRange);
    const friends = nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER && org.id !== this.id);

    if (friends.length === 0) {
      this.currentState = GlimmerState.IDLE;
      return;
    }

    // 计算同伴的平均位置
    const avgX = friends.reduce((sum, f) => sum + f.position.x, 0) / friends.length;
    const avgY = friends.reduce((sum, f) => sum + f.position.y, 0) / friends.length;

    // 向群体中心移动
    const targetPosition = { x: Math.round(avgX), y: Math.round(avgY) };
    this.moveToTarget(environment, targetPosition);
  }

  // 执行繁殖行为
  private executeReproducing(environment: Environment): void {
    // 检查附近是否有其他 Glimmer
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.socialRange);
    const friends = nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER && org.id !== this.id);

    if (friends.length >= 2) {
      // 群体足够大，尝试繁殖
      this.currentState = GlimmerState.IDLE;
    }
  }

  // 执行空闲行为
  private executeIdle(environment: Environment): void {
    // 有概率随机移动，保持活跃
    if (Math.random() < 0.3) {
      const validMoves = environment.getValidMoves(this.position, this.state.speed * 0.5);
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.move(randomMove, environment);
      }
    }
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

  // 繁殖
  reproduce(environment: Environment): Glimmer | null {
    if (!this.canReproduce() || this.reproductionCooldown > 0) return null;

    // 检查附近是否有足够的光尘支持后代
    const nearbyOrganisms = environment.getNearbyOrganisms(this.position, this.socialRange);
    const friends = nearbyOrganisms.filter(org => org.type === OrganismType.GLIMMER && org.id !== this.id);

    if (friends.length < 2) return null;  // 需要至少2个同伴

    this.state.energy -= this.reproductionCost;
    this.reproductionCooldown = 30;

    // 生成后代位置（当前位置附近）
    const offspringPosition: Coordinates = {
      x: Math.max(0, Math.min(environment.width - 1, this.position.x + (Math.random() > 0.5 ? 1 : -1))),
      y: Math.max(0, Math.min(environment.height - 1, this.position.y + (Math.random() > 0.5 ? 1 : -1))),
    };

    const offspringImprints = this.getOffspringImprints(environment);
    const offspring = new Glimmer(offspringPosition, offspringImprints);

    // 继承部分记忆
    offspring.memories = this.memories.slice(0, 3);

    offspring.mutate();
    return offspring;
  }
}
