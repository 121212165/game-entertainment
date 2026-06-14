function initEnvironment() {
  const env = new Environment(50, 50);
  for (let i = 0; i < 30; i++) {
    env.addOrganism(new Glimmer({
      x: Math.floor(Math.random() * env.width),
      y: Math.floor(Math.random() * env.height)
    }));
  }
  for (let i = 0; i < 5; i++) {
    env.addOrganism(new Gloomer({
      x: Math.floor(Math.random() * env.width),
      y: Math.floor(Math.random() * env.height)
    }));
  }
  return env;
}

const App = {
  env: null,
  renderer: null,
  popChart: null,
  evoChart: null,
  running: false,
  speed: 1,
  stepCount: 0,
  intervalId: null,

  init() {
    this.env = initEnvironment();
    const canvas = document.getElementById('world');
    this.renderer = new Renderer(canvas, this.env, 12);
    this.popChart = new ChartRenderer('popChart');
    this.evoChart = new ChartRenderer('evoChart');
    this._bindUI();
    this.renderer.render();
    this._updateStatus();
  },

  _bindUI() {
    document.getElementById('btnToggle').onclick = () => this.toggle();
    document.getElementById('btnStep').onclick = () => this.step();
    document.getElementById('btnReset').onclick = () => this.reset();
    document.getElementById('speedSlider').oninput = (e) => {
      this.speed = parseInt(e.target.value);
      document.getElementById('speedVal').textContent = this.speed + 'x';
      if (this.running) { this._stopLoop(); this._startLoop(); }
    };
  },

  toggle() {
    this.running = !this.running;
    if (this.running) this._startLoop(); else this._stopLoop();
    this._updateStatus();
  },

  step() {
    this.env.update();
    this.stepCount++;
    this._collectStats();
    this.renderer.render();
    this._renderCharts();
    this._updateStatus();
  },

  reset() {
    this.running = false;
    this._stopLoop();
    this.env = initEnvironment();
    this.renderer.env = this.env;
    this.stepCount = 0;
    this.popChart.data = [];
    this.evoChart.data = [];
    this.renderer.render();
    this._renderCharts();
    this._updateStatus();
    document.getElementById('btnToggle').textContent = '继续';
  },

  _startLoop() {
    const delay = 1000 / this.speed;
    this.intervalId = setInterval(() => this.step(), delay);
    document.getElementById('btnToggle').textContent = '暂停';
  },

  _stopLoop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    document.getElementById('btnToggle').textContent = '继续';
  },

  _updateStatus() {
    document.getElementById('statusText').textContent = this.running ? '运行中' : '已暂停';
    document.getElementById('statusText').className = this.running ? 'status-running' : 'status-paused';
    document.getElementById('stepCount').textContent = this.stepCount;
    document.getElementById('glimmerCount').textContent = this.env.organisms.filter(o => o.type === OrganismType.GLIMMER).length;
    document.getElementById('gloomerCount').textContent = this.env.organisms.filter(o => o.type === OrganismType.GLOOMER).length;
  },

  _collectStats() {
    const glimmers = this.env.organisms.filter(o => o.type === OrganismType.GLIMMER);
    const forestGlimmers = glimmers.filter(g => g.geneticImprints.includes(GeneticImprint.FOREST_CHILD));
    const gloomers = this.env.organisms.filter(o => o.type === OrganismType.GLOOMER);
    let totalDust = 0;
    for (let y = 0; y < this.env.height; y++)
      for (let x = 0; x < this.env.width; x++)
        totalDust += this.env.grid[y][x].lightDust;

    this.popChart.push({
      step: this.stepCount,
      glimmerCount: glimmers.length - forestGlimmers.length,
      forestGlimmerCount: forestGlimmers.length,
      gloomerCount: gloomers.length,
      lightDustTotal: totalDust
    });

    this.evoChart.push({
      step: this.stepCount,
      avgGlimmerSpeed: glimmers.length > 0 ? glimmers.reduce((s, g) => s + g.state.speed, 0) / glimmers.length : 0,
      avgGlimmerVision: glimmers.length > 0 ? glimmers.reduce((s, g) => s + g.state.visionRange, 0) / glimmers.length : 0,
      avgGloomerSpeed: gloomers.length > 0 ? gloomers.reduce((s, g) => s + g.state.speed, 0) / gloomers.length : 0,
      avgGloomerVision: gloomers.length > 0 ? gloomers.reduce((s, g) => s + g.state.visionRange, 0) / gloomers.length : 0
    });
  },

  _renderCharts() {
    this.popChart.render({
      title: '种群动态',
      series: [
        { key: 'glimmerCount', name: '普通光能体', color: '#ffc107' },
        { key: 'forestGlimmerCount', name: '森林之子', color: '#28a745' },
        { key: 'gloomerCount', name: '暗影体', color: '#6f42c1' }
      ]
    });
    this.evoChart.render({
      title: '属性演化趋势',
      series: [
        { key: 'avgGlimmerSpeed', name: '光能体速度', color: '#ff9800' },
        { key: 'avgGlimmerVision', name: '光能体视野', color: '#2196f3' },
        { key: 'avgGloomerSpeed', name: '暗影体速度', color: '#9c27b0' },
        { key: 'avgGloomerVision', name: '暗影体视野', color: '#e91e63' }
      ]
    });
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
