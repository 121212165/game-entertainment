class Environment {
  constructor(width = 50, height = 50) {
    this.width = width;
    this.height = height;
    this.grid = this._generateTerrain();
    this.organisms = [];
    this.version = 0;
  }

  _generateTerrain() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const rand = Math.random();
        let type;
        if (rand < 0.1) type = TerrainType.LIGHT_SPRING;
        else if (rand < 0.4) type = TerrainType.FOREST;
        else type = TerrainType.PLAIN;
        row.push({ type, lightDust: this._initialDust(type) });
      }
      grid.push(row);
    }
    return grid;
  }

  _initialDust(type) {
    if (type === TerrainType.LIGHT_SPRING) return 100;
    if (type === TerrainType.FOREST) return 30;
    return 50;
  }

  _regenerateResources() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.grid[y][x];
        let rate = 3;
        if (t.type === TerrainType.LIGHT_SPRING) rate = 5;
        else if (t.type === TerrainType.FOREST) rate = 2;
        t.lightDust = Math.min(100, t.lightDust + rate);
      }
    }
  }

  _generateGlimmerInForest() {
    const newGlimmers = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.grid[y][x];
        if (t.type === TerrainType.FOREST && t.lightDust > 80 && Math.random() < 0.01) {
          newGlimmers.push(new Glimmer({ x, y }));
          t.lightDust -= 50;
        }
      }
    }
    return newGlimmers;
  }

  update() {
    this._regenerateResources();
    const deadIds = new Set();
    const newOffspring = this._generateGlimmerInForest();

    for (const org of this.organisms) {
      org.update(this);
      if (org.state.energy <= 0 || org.state.age >= org.state.maxAge) {
        deadIds.add(org.id);
      } else {
        const offspring = org.reproduce(this);
        if (offspring) newOffspring.push(offspring);
      }
    }

    if (deadIds.size > 0) this.organisms = this.organisms.filter(o => !deadIds.has(o.id));
    this.organisms.push(...newOffspring);
    this.version++;
  }

  addOrganism(organism) { this.organisms.push(organism); }

  removeOrganism(id) { this.organisms = this.organisms.filter(o => o.id !== id); }

  getTerrain(pos) {
    if (this._isValid(pos)) return this.grid[pos.y][pos.x];
    throw new Error(`Invalid position: (${pos.x}, ${pos.y})`);
  }

  getSafeTerrain(pos) {
    if (this._isValid(pos)) return this.grid[pos.y][pos.x];
    return null;
  }

  getOrganismsAt(pos) {
    return this.organisms.filter(o => o.position.x === pos.x && o.position.y === pos.y);
  }

  getNearbyOrganisms(pos, range) {
    return this.organisms.filter(o =>
      Math.abs(o.position.x - pos.x) + Math.abs(o.position.y - pos.y) <= range
    );
  }

  getValidMoves(pos, speed) {
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
      { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
    ];
    const moves = [];
    for (const d of dirs) {
      let nx = Math.round(pos.x + d.dx * speed);
      let ny = Math.round(pos.y + d.dy * speed);
      nx = Math.max(0, Math.min(this.width - 1, nx));
      ny = Math.max(0, Math.min(this.height - 1, ny));
      const np = { x: nx, y: ny };
      if (this._isValid(np) && !moves.some(m => m.x === nx && m.y === ny)) moves.push(np);
    }
    return moves;
  }

  consumeLightDust(pos, amount) {
    if (this._isValid(pos)) {
      this.grid[pos.y][pos.x].lightDust = Math.max(0, this.grid[pos.y][pos.x].lightDust - amount);
    }
  }

  _isValid(pos) {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }
}

let _idCounter = 0;

class Organism {
  constructor(type, position, initialState = {}, geneticImprints = []) {
    this.type = type;
    this.id = `${type.toLowerCase()}_${++_idCounter}_${Math.random().toString(36).substring(2, 7)}`;
    this.position = { ...position };
    this.geneticImprints = [...geneticImprints];
    this.memories = [];
    this.state = {
      energy: initialState.energy || 50,
      age: initialState.age || 0,
      maxAge: initialState.maxAge || 100,
      speed: initialState.speed || 1,
      visionRange: initialState.visionRange || 5
    };
    this.reproductionCost = 30;
    this.baseEnergyConsumption = 1;
    this.maxMemories = 10;
    this.memoryDecay = 50;
  }

  update(env) { throw new Error('abstract'); }
  reproduce(env) { throw new Error('abstract'); }

  _move(newPos, env) {
    if (newPos.x >= 0 && newPos.x < env.width && newPos.y >= 0 && newPos.y < env.height) {
      this.position = { ...newPos };
      this._consumeEnergy(env);
    }
  }

  _consumeEnergy(env) {
    let cost = this.baseEnergyConsumption;
    const terrain = env.getTerrain(this.position);
    if (terrain.type === TerrainType.FOREST && !this.geneticImprints.includes(GeneticImprint.FOREST_CHILD)) cost += 1;
    if (this.geneticImprints.includes(GeneticImprint.EFFICIENT)) cost *= 0.8;
    this.state.energy -= cost;
  }

  _addMemory(position, value, currentTime) {
    const idx = this.memories.findIndex(m =>
      Math.abs(m.position.x - position.x) <= 2 && Math.abs(m.position.y - position.y) <= 2
    );
    if (idx >= 0) {
      this.memories[idx] = { position, value, timestamp: currentTime };
    } else {
      this.memories.push({ position, value, timestamp: currentTime });
      if (this.memories.length > this.maxMemories) {
        this.memories.sort((a, b) => {
          if (b.timestamp - a.timestamp > this.memoryDecay) return -1;
          return Math.abs(b.value) - Math.abs(a.value);
        });
        this.memories = this.memories.slice(0, this.maxMemories);
      }
    }
  }

  _getValuableMemories(currentTime, minValue = 10) {
    return this.memories.filter(m =>
      currentTime - m.timestamp < this.memoryDecay && Math.abs(m.value) >= minValue
    );
  }

  _mutate() {
    if (Math.random() < 0.1) this.state.speed = Math.max(0.5, this.state.speed * (0.9 + Math.random() * 0.2));
    if (Math.random() < 0.1) this.state.visionRange = Math.max(2, this.state.visionRange * (0.9 + Math.random() * 0.2));
    if (Math.random() < 0.02) {
      const all = [GeneticImprint.SWIFT, GeneticImprint.VIGILANT, GeneticImprint.EFFICIENT, GeneticImprint.SOCIAL];
      const ni = all[Math.floor(Math.random() * all.length)];
      if (!this.geneticImprints.includes(ni)) this.geneticImprints.push(ni);
    }
  }

  _canReproduce() {
    return this.state.energy > this.reproductionCost * 2 && this.state.age > 10;
  }

  _getOffspringImprints(env) {
    const imprints = [...this.geneticImprints];
    const terrain = env.getTerrain(this.position);
    if (terrain.type === TerrainType.FOREST && !imprints.includes(GeneticImprint.FOREST_CHILD)) {
      imprints.push(GeneticImprint.FOREST_CHILD);
    }
    return imprints;
  }

  _distanceTo(pos) {
    return Math.abs(this.position.x - pos.x) + Math.abs(this.position.y - pos.y);
  }

  _moveToTarget(env, target) {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    let nx = this.position.x;
    let ny = this.position.y;
    if (Math.abs(dx) > Math.abs(dy)) nx += dx > 0 ? Math.min(this.state.speed, dx) : Math.max(-this.state.speed, dx);
    else ny += dy > 0 ? Math.min(this.state.speed, dy) : Math.max(-this.state.speed, dy);
    nx = Math.max(0, Math.min(env.width - 1, nx));
    ny = Math.max(0, Math.min(env.height - 1, ny));
    this._move({ x: nx, y: ny }, env);
  }
}

class Glimmer extends Organism {
  constructor(position, geneticImprints = []) {
    super(OrganismType.GLIMMER, position, { energy: 50, maxAge: 80, speed: 1.5, visionRange: 6 }, geneticImprints);
    this.blinkCooldown = 20;
    this.blinkTimer = 0;
    this.currentState = GlimmerState.IDLE;
    this.socialRange = 4;
    this.reproductionCooldown = 0;
    if (this.geneticImprints.includes(GeneticImprint.SWIFT)) this.state.speed *= 1.2;
    if (this.geneticImprints.includes(GeneticImprint.VIGILANT)) this.state.visionRange *= 1.3;
    if (this.geneticImprints.includes(GeneticImprint.SOCIAL)) this.socialRange *= 1.5;
    this.reproductionCost = 25;
    this.baseEnergyConsumption = 1;
  }

  update(env) {
    this.state.age++;
    if (this.blinkTimer > 0) this.blinkTimer--;
    if (this.reproductionCooldown > 0) this.reproductionCooldown--;
    this._decideState(env);
    switch (this.currentState) {
      case GlimmerState.FLEEING: this._executeFleeing(env); break;
      case GlimmerState.REPRODUCING: this._executeReproducing(env); break;
      case GlimmerState.FORAGING: this._executeForaging(env); break;
      case GlimmerState.SOCIALIZING: this._executeSocializing(env); break;
      default: this._executeIdle(env); break;
    }
  }

  _decideState(env) {
    const threats = this._detectThreats(env);
    if (threats.length > 0) { this.currentState = GlimmerState.FLEEING; return; }
    if (this._canReproduce() && this.reproductionCooldown === 0 && this.state.energy > 60) { this.currentState = GlimmerState.REPRODUCING; return; }
    if (this.state.energy < 70) { this.currentState = GlimmerState.FORAGING; return; }
    const friends = this._countNearbyFriends(env);
    if (friends < 3 && friends > 0) { this.currentState = GlimmerState.SOCIALIZING; return; }
    this.currentState = GlimmerState.IDLE;
  }

  _detectThreats(env) {
    return env.getNearbyOrganisms(this.position, this.state.visionRange).filter(o => o.type === OrganismType.GLOOMER);
  }

  _countNearbyFriends(env) {
    return env.getNearbyOrganisms(this.position, this.socialRange).filter(o => o.type === OrganismType.GLIMMER && o.id !== this.id).length;
  }

  _executeFleeing(env) {
    const threats = this._detectThreats(env);
    if (threats.length === 0) { this.currentState = GlimmerState.IDLE; return; }
    let closest = threats[0], minDist = this._distanceTo(closest.position);
    for (const t of threats) { const d = this._distanceTo(t.position); if (d < minDist) { minDist = d; closest = t; } }
    this._addMemory(closest.position, -100, env.version);
    if (minDist <= 3 && this.blinkTimer === 0) this._blinkToSafety(env, closest.position);
    else this._flee(env, closest.position);
  }

  _blinkToSafety(env, threatPos) {
    if (this.state.energy < 15) return;
    const validMoves = env.getValidMoves(this.position, this.state.visionRange);
    let safest = this.position, bestScore = -Infinity;
    for (const m of validMoves) {
      let score = this._distanceTo(threatPos);
      const t = env.getSafeTerrain(m);
      if (t) {
        if (t.type === TerrainType.FOREST) score += 10;
        if (t.type === TerrainType.LIGHT_SPRING) score += 5;
        score += t.lightDust / 10;
      }
      if (score > bestScore) { bestScore = score; safest = m; }
    }
    if (safest.x !== this.position.x || safest.y !== this.position.y) {
      this.state.energy -= 15;
      this.position = safest;
      this.blinkTimer = this.blinkCooldown;
      this._consumeEnergy(env);
    }
  }

  _flee(env, threatPos) {
    const validMoves = env.getValidMoves(this.position, this.state.speed);
    let best = this.position, bestScore = this._distanceTo(threatPos);
    for (const m of validMoves) {
      const dist = Math.abs(m.x - threatPos.x) + Math.abs(m.y - threatPos.y);
      let score = dist * 2;
      const t = env.getSafeTerrain(m);
      if (t) { if (t.type === TerrainType.FOREST) score += 10; if (t.type === TerrainType.LIGHT_SPRING) score += 5; }
      if (score > bestScore) { bestScore = score; best = m; }
    }
    this._move(best, env);
  }

  _executeForaging(env) {
    const ct = env.getTerrain(this.position);
    if (ct.lightDust > 0) {
      const eat = Math.min(20, ct.lightDust);
      this.state.energy = Math.min(100, this.state.energy + eat);
      env.consumeLightDust(this.position, eat);
      return;
    }
    const foodMem = this._getValuableMemories(env.version, 30);
    if (foodMem.length > 0) {
      foodMem.sort((a, b) => this._distanceTo(a.position) - this._distanceTo(b.position));
      this._moveToTarget(env, foodMem[0].position);
      return;
    }
    const validMoves = env.getValidMoves(this.position, this.state.speed);
    let best = this.position, maxDust = 0;
    for (const m of validMoves) {
      const t = env.getSafeTerrain(m);
      if (t && t.lightDust > 0) {
        let priority = t.lightDust;
        if (t.type === TerrainType.LIGHT_SPRING) priority += 50;
        if (t.type === TerrainType.FOREST) priority += 20;
        if (priority > maxDust) { maxDust = priority; best = m; }
      }
    }
    if (maxDust > 30) this._addMemory(best, maxDust, env.version);
    if (best.x !== this.position.x || best.y !== this.position.y) this._move(best, env);
    else if (validMoves.length > 0) this._move(validMoves[Math.floor(Math.random() * validMoves.length)], env);
  }

  _executeSocializing(env) {
    const friends = env.getNearbyOrganisms(this.position, this.socialRange).filter(o => o.type === OrganismType.GLIMMER && o.id !== this.id);
    if (friends.length === 0) { this.currentState = GlimmerState.IDLE; return; }
    const avgX = friends.reduce((s, f) => s + f.position.x, 0) / friends.length;
    const avgY = friends.reduce((s, f) => s + f.position.y, 0) / friends.length;
    this._moveToTarget(env, { x: Math.round(avgX), y: Math.round(avgY) });
  }

  _executeReproducing(env) {
    const friends = env.getNearbyOrganisms(this.position, this.socialRange).filter(o => o.type === OrganismType.GLIMMER && o.id !== this.id);
    if (friends.length >= 2) this.currentState = GlimmerState.IDLE;
  }

  _executeIdle(env) {
    if (Math.random() < 0.3) {
      const validMoves = env.getValidMoves(this.position, this.state.speed * 0.5);
      if (validMoves.length > 0) this._move(validMoves[Math.floor(Math.random() * validMoves.length)], env);
    }
  }

  reproduce(env) {
    if (!this._canReproduce() || this.reproductionCooldown > 0) return null;
    const friends = env.getNearbyOrganisms(this.position, this.socialRange).filter(o => o.type === OrganismType.GLIMMER && o.id !== this.id);
    if (friends.length < 2) return null;
    this.state.energy -= this.reproductionCost;
    this.reproductionCooldown = 30;
    const offPos = {
      x: Math.max(0, Math.min(env.width - 1, this.position.x + (Math.random() > 0.5 ? 1 : -1))),
      y: Math.max(0, Math.min(env.height - 1, this.position.y + (Math.random() > 0.5 ? 1 : -1)))
    };
    const offspring = new Glimmer(offPos, this._getOffspringImprints(env));
    offspring.memories = this.memories.slice(0, 3);
    offspring._mutate();
    return offspring;
  }
}

class Gloomer extends Organism {
  constructor(position) {
    super(OrganismType.GLOOMER, position, { energy: 80, maxAge: 120, speed: 2.0, visionRange: 8 }, []);
    this.currentState = GloomerState.PATROLLING;
    this.hunger = 0;
    this.ambushTimer = 0;
    this.targetId = null;
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.reproductionCost = 40;
    this.baseEnergyConsumption = 2;
  }

  update(env) {
    this.state.age++;
    this.hunger++;
    if (this.ambushTimer > 0) this.ambushTimer--;
    this._decideState(env);
    switch (this.currentState) {
      case GloomerState.STARVING: this._executeStarving(env); break;
      case GloomerState.CHASING: this._executeChasing(env); break;
      case GloomerState.AMBUSHING: this._executeAmbushing(env); break;
      case GloomerState.PATROLLING: this._executePatrolling(env); break;
      default: this._executeResting(env); break;
    }
    this._consumeEnergy(env);
  }

  _decideState(env) {
    if (this.state.energy < 20 || this.hunger > 50) { this.currentState = GloomerState.STARVING; return; }
    const prey = this._detectPrey(env);
    if (prey.length > 0) { this.currentState = GloomerState.CHASING; this.targetId = prey[0].id; return; }
    const mem = this._getValuableMemories(env.version, 50);
    if (mem.length > 0 && this.ambushTimer === 0 && this._findBestAmbushSpot(env, mem)) { this.currentState = GloomerState.AMBUSHING; return; }
    if (this.state.energy > 60) { this.currentState = GloomerState.PATROLLING; return; }
    this.currentState = GloomerState.RESTING;
  }

  _detectPrey(env) {
    return env.getNearbyOrganisms(this.position, this.state.visionRange).filter(o => o.type === OrganismType.GLIMMER);
  }

  _executeStarving(env) {
    const prey = env.getNearbyOrganisms(this.position, this.state.visionRange * 1.5).filter(o => o.type === OrganismType.GLIMMER);
    if (prey.length > 0) {
      let closest = prey[0], minDist = this._distanceTo(closest.position);
      for (const p of prey) { const d = this._distanceTo(p.position); if (d < minDist) { minDist = d; closest = p; } }
      this._chaseTarget(env, closest.position, this.state.speed * 1.2);
      if (minDist <= 1.5) this._consumePrey(env, closest);
    } else this._wanderDesperately(env);
    this.state.energy -= this.baseEnergyConsumption;
  }

  _executeChasing(env) {
    if (!this.targetId) { this.currentState = GloomerState.PATROLLING; return; }
    const nearby = env.getNearbyOrganisms(this.position, this.state.visionRange);
    const target = nearby.find(o => o.id === this.targetId);
    if (!target || target.type !== OrganismType.GLIMMER) {
      const mem = this._getValuableMemories(env.version, 50);
      if (mem.length > 0) this._moveToTarget(env, mem[0].position);
      else { this.currentState = GloomerState.PATROLLING; this.targetId = null; }
      return;
    }
    const dist = this._distanceTo(target.position);
    this._addMemory(target.position, 100, env.version);
    if (dist <= 1.5) { this._consumePrey(env, target); this.targetId = null; }
    else {
      this._chaseTarget(env, target.position, this.state.speed);
      if (dist < this.state.visionRange * 0.5) this._predictAndIntercept(env, target);
    }
  }

  _chaseTarget(env, targetPos, speedMul = 1) {
    const dx = targetPos.x - this.position.x;
    const dy = targetPos.y - this.position.y;
    let nx = this.position.x, ny = this.position.y;
    const sp = this.state.speed * speedMul;
    if (Math.abs(dx) > Math.abs(dy)) nx += dx > 0 ? Math.min(sp, dx) : Math.max(-sp, dx);
    else ny += dy > 0 ? Math.min(sp, dy) : Math.max(-sp, dy);
    nx = Math.max(0, Math.min(env.width - 1, nx));
    ny = Math.max(0, Math.min(env.height - 1, ny));
    this._move({ x: nx, y: ny }, env);
  }

  _predictAndIntercept(env, prey) {
    const dx = prey.position.x - this.position.x;
    const dy = prey.position.y - this.position.y;
    const px = prey.position.x + (dx > 0 ? 2 : -2);
    const py = prey.position.y + (dy > 0 ? 2 : -2);
    if (Math.random() < 0.3) {
      this._chaseTarget(env, {
        x: Math.max(0, Math.min(env.width - 1, px)),
        y: Math.max(0, Math.min(env.height - 1, py))
      }, this.state.speed * 0.8);
    }
  }

  _executeAmbushing(env) {
    const ct = env.getTerrain(this.position);
    if (ct.type === TerrainType.FOREST) {
      this.baseEnergyConsumption = 0.5;
      const prey = env.getNearbyOrganisms(this.position, this.state.visionRange * 0.7).filter(o => o.type === OrganismType.GLIMMER);
      if (prey.length > 0) {
        this.currentState = GloomerState.CHASING;
        this.targetId = prey[0].id;
        this.baseEnergyConsumption = 2;
      } else {
        this.ambushTimer++;
        if (this.ambushTimer > 20) { this.currentState = GloomerState.PATROLLING; this.baseEnergyConsumption = 2; }
      }
    } else {
      const mem = this._getValuableMemories(env.version, 50);
      if (mem.length > 0) this._moveToTarget(env, mem[0].position);
      else this._moveToNearestForest(env);
    }
  }

  _executePatrolling(env) {
    const prey = this._detectPrey(env);
    if (prey.length > 0) { this.currentState = GloomerState.CHASING; this.targetId = prey[0].id; return; }
    const md = this.state.speed;
    const nx = Math.max(0, Math.min(env.width - 1, Math.round(this.position.x + Math.cos(this.patrolAngle) * md)));
    const ny = Math.max(0, Math.min(env.height - 1, Math.round(this.position.y + Math.sin(this.patrolAngle) * md)));
    this._move({ x: nx, y: ny }, env);
    this.patrolAngle += (Math.random() - 0.5) * 0.5;
    this._addMemory({ x: nx, y: ny }, 10, env.version);
  }

  _executeResting(env) {
    this.baseEnergyConsumption = 0.5;
    if (Math.random() < 0.2) {
      const prey = this._detectPrey(env);
      if (prey.length > 0) { this.currentState = GloomerState.CHASING; this.targetId = prey[0].id; this.baseEnergyConsumption = 2; }
    }
  }

  _wanderDesperately(env) {
    const validMoves = env.getValidMoves(this.position, this.state.speed * 0.5);
    if (validMoves.length > 0) {
      const mem = this._getValuableMemories(env.version, 30);
      if (mem.length > 0) this._moveToTarget(env, mem[0].position);
      else this._move(validMoves[Math.floor(Math.random() * validMoves.length)], env);
    }
  }

  _moveToNearestForest(env) {
    let nearest = this.position, minDist = Infinity;
    for (let dy = -10; dy <= 10; dy++) {
      for (let dx = -10; dx <= 10; dx++) {
        const x = this.position.x + dx, y = this.position.y + dy;
        if (x >= 0 && x < env.width && y >= 0 && y < env.height) {
          const t = env.getSafeTerrain({ x, y });
          if (t && t.type === TerrainType.FOREST) {
            const dist = Math.abs(dx) + Math.abs(dy);
            if (dist < minDist) { minDist = dist; nearest = { x, y }; }
          }
        }
      }
    }
    this._moveToTarget(env, nearest);
  }

  _findBestAmbushSpot(env, memories) {
    let bestSpot = null, bestScore = -Infinity;
    for (const mem of memories) {
      for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const x = mem.position.x + dx, y = mem.position.y + dy;
          if (x >= 0 && x < env.width && y >= 0 && y < env.height) {
            const t = env.getSafeTerrain({ x, y });
            if (t && t.type === TerrainType.FOREST) {
              const score = mem.value - (Math.abs(dx) + Math.abs(dy));
              if (score > bestScore) { bestScore = score; bestSpot = { position: { x, y } }; }
            }
          }
        }
      }
    }
    return bestSpot;
  }

  _consumePrey(env, prey) {
    env.removeOrganism(prey.id);
    this.state.energy = Math.min(100, this.state.energy + 50);
    this.hunger = 0;
    this.currentState = GloomerState.RESTING;
    this.memories = this.memories.filter(m => m.position.x !== prey.position.x || m.position.y !== prey.position.y);
  }

  reproduce(env) {
    if (!this._canReproduce() || this.state.energy < 70) return null;
    this.state.energy -= this.reproductionCost;
    const offPos = {
      x: Math.max(0, Math.min(env.width - 1, this.position.x + (Math.random() > 0.5 ? 1 : -1))),
      y: Math.max(0, Math.min(env.height - 1, this.position.y + (Math.random() > 0.5 ? 1 : -1)))
    };
    const offspring = new Gloomer(offPos);
    offspring.memories = this.memories.filter(m => m.value > 0).slice(0, 5);
    offspring._mutate();
    return offspring;
  }
}
