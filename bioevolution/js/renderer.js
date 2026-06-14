class Renderer {
  constructor(canvas, environment, cellSize = 12) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.env = environment;
    this.cellSize = cellSize;
    this.hoverX = -1;
    this.hoverY = -1;
    this.tooltip = null;
    this._setupCanvas();
    this._bindEvents();
  }

  _setupCanvas() {
    this.canvas.width = this.env.width * this.cellSize;
    this.canvas.height = this.env.height * this.cellSize;
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.hoverX = Math.floor((e.clientX - rect.left) / this.cellSize);
      this.hoverY = Math.floor((e.clientY - rect.top) / this.cellSize);
      if (this.hoverX < 0 || this.hoverX >= this.env.width || this.hoverY < 0 || this.hoverY >= this.env.height) {
        this.hoverX = -1; this.hoverY = -1;
      }
      this._updateTooltip(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverX = -1; this.hoverY = -1;
      if (this.tooltip) { this.tooltip.style.display = 'none'; }
    });
  }

  _updateTooltip(mx, my) {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'tooltip';
      document.body.appendChild(this.tooltip);
    }
    if (this.hoverX < 0) { this.tooltip.style.display = 'none'; return; }

    const terrain = this.env.grid[this.hoverY][this.hoverX];
    const orgs = this.env.getOrganismsAt({ x: this.hoverX, y: this.hoverY });
    const tNames = { PLAIN: '平原', FOREST: '森林', LIGHT_SPRING: '光泉' };
    const oNames = { GLIMMER: '光能体', GLOOMER: '暗影体' };
    const gStates = { IDLE: '休息', FORAGING: '觅食', FLEEING: '逃跑', REPRODUCING: '繁殖', SOCIALIZING: '群聚' };
    const gmStates = { PATROLLING: '巡逻', CHASING: '追逐', AMBUSHING: '伏击', RESTING: '休眠', STARVING: '饥饿' };
    const imprintNames = { FOREST_CHILD: '森林之子', SWIFT: '敏捷', VIGILANT: '警觉', EFFICIENT: '高效', SOCIAL: '社交' };

    let html = `<b>位置: (${this.hoverX}, ${this.hoverY})</b><br>地形: ${tNames[terrain.type]} | 光尘: ${terrain.lightDust.toFixed(1)}`;
    if (orgs.length > 0) {
      html += `<br><b>生物 (${orgs.length}):</b>`;
      for (const o of orgs) {
        const st = o.type === OrganismType.GLIMMER ? gStates[o.currentState] : gmStates[o.currentState];
        const imps = o.geneticImprints.map(i => imprintNames[i]).join(', ') || '无';
        html += `<br>· ${oNames[o.type]} E:${o.state.energy.toFixed(0)} A:${o.state.age} S:${o.state.speed.toFixed(1)} V:${o.state.visionRange.toFixed(1)} [${st}] 印记:${imps}`;
      }
    }
    this.tooltip.innerHTML = html;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (mx + 15) + 'px';
    this.tooltip.style.top = (my + 15) + 'px';
  }

  render() {
    const ctx = this.ctx;
    const cs = this.cellSize;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Terrain
    for (let y = 0; y < this.env.height; y++) {
      for (let x = 0; x < this.env.width; x++) {
        const t = this.env.grid[y][x];
        if (t.type === TerrainType.PLAIN) ctx.fillStyle = 'rgb(220,200,160)';
        else if (t.type === TerrainType.FOREST) ctx.fillStyle = 'rgb(80,120,80)';
        else ctx.fillStyle = 'rgb(160,200,255)';
        ctx.fillRect(x * cs, y * cs, cs, cs);
        if (t.lightDust > 0) {
          ctx.fillStyle = `rgba(255,255,200,${Math.min(t.lightDust / 100, 1) * 0.5})`;
          ctx.fillRect(x * cs, y * cs, cs, cs);
        }
      }
    }

    // Organisms
    for (const o of this.env.organisms) {
      const cx = o.position.x * cs + cs / 2;
      const cy = o.position.y * cs + cs / 2;
      const r = cs * 0.4;
      ctx.beginPath();
      if (o.type === OrganismType.GLIMMER) {
        if (o.geneticImprints.includes(GeneticImprint.FOREST_CHILD)) {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, 'rgb(100,255,150)'); g.addColorStop(1, 'rgb(50,200,100)');
          ctx.fillStyle = g;
        } else {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, 'rgb(255,255,150)'); g.addColorStop(1, 'rgb(255,200,50)');
          ctx.fillStyle = g;
        }
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, 'rgb(150,100,255)'); g.addColorStop(1, 'rgb(100,50,200)');
        ctx.fillStyle = g;
        ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.env.width; x++) {
      ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, this.env.height * cs); ctx.stroke();
    }
    for (let y = 0; y <= this.env.height; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(this.env.width * cs, y * cs); ctx.stroke();
    }
  }
}

class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.data = [];
    this.maxPoints = 200;
  }

  push(point) {
    this.data.push(point);
    if (this.data.length > this.maxPoints) this.data = this.data.slice(-this.maxPoints);
  }

  render(config) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (this.data.length < 2) return;

    const pad = { top: 30, right: 20, bottom: 30, left: 50 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.title, w / 2, 18);

    // Axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Calculate scales
    let maxY = 1;
    for (const d of this.data) {
      for (const s of config.series) {
        const v = d[s.key] || 0;
        if (v > maxY) maxY = v;
      }
    }
    maxY = Math.ceil(maxY * 1.1) || 1;

    const xStep = plotW / (this.data.length - 1);

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxY * i / 4);
      const y = pad.top + plotH - (plotH * i / 4);
      ctx.fillText(val, pad.left - 5, y + 3);
      ctx.strokeStyle = '#f0f0f0';
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
    }

    // Draw series
    for (const s of config.series) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < this.data.length; i++) {
        const x = pad.left + i * xStep;
        const y = pad.top + plotH - ((this.data[i][s.key] || 0) / maxY) * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Legend
    let lx = pad.left + 10;
    ctx.font = '11px sans-serif';
    for (const s of config.series) {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, pad.top + plotH + 10, 12, 12);
      ctx.fillStyle = '#333';
      ctx.fillText(s.name, lx + 16, pad.top + plotH + 20);
      lx += ctx.measureText(s.name).width + 35;
    }
  }
}
