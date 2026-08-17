import type { LevelDef } from '../types.ts'

type Slider = {
  id: string
  label: string
  min: number
  max: number
  step: number
  get: () => number
  set: (n: number) => void
  fmt: (n: number) => string
}

type Section = {
  id: string
  title: string
  sliders: Slider[]
}

export class EditorPanel {
  private root: HTMLDivElement
  private body: HTMLDivElement
  private open = false
  private openSections = new Set<string>()

  constructor(level: LevelDef, onChange: () => void) {
    this.root = document.createElement('div')
    this.root.id = 'editor-panel'
    Object.assign(this.root.style, {
      position: 'fixed',
      right: '12px',
      top: '12px',
      width: '250px',
      zIndex: '20',
      background: 'rgba(26,20,16,0.88)',
      color: '#fff4e0',
      fontFamily: 'Nunito, system-ui, sans-serif',
      fontSize: '13px',
      borderRadius: '10px',
      border: '2px solid #1a1410',
      pointerEvents: 'auto',
    })

    const head = document.createElement('button')
    head.type = 'button'
    head.textContent = '▸  GAMEPLAY'
    head.style.cssText =
      'width:100%;text-align:left;background:none;border:0;color:#fff4e0;font-family:Bangers,system-ui;font-size:22px;letter-spacing:1px;padding:10px 14px;cursor:pointer;'
    this.root.appendChild(head)

    this.body = document.createElement('div')
    this.body.style.cssText = 'display:none;padding:0 12px 12px;max-height:calc(100vh - 80px);overflow-y:auto;'
    this.root.appendChild(this.body)

    const sections: Section[] = [
      {
        id: 'ladies',
        title: 'Ladies',
        sliders: [
          {
            id: 'count',
            label: 'At once',
            min: 1,
            max: 8,
            step: 1,
            get: () => level.director.maxConcurrent,
            set: (n) => {
              level.director.maxConcurrent = n
            },
            fmt: (n) => String(n),
          },
          {
            id: 'spawn',
            label: 'Spawn gap',
            min: 400,
            max: 3200,
            step: 50,
            get: () => level.director.popInterval[0],
            set: (n) => {
              level.director.popInterval = [n, Math.round(n * 1.8)]
            },
            fmt: (n) => `${(n / 1000).toFixed(2)}s`,
          },
          {
            id: 'stay',
            label: 'Stay time',
            min: 400,
            max: 3200,
            step: 50,
            get: () => level.director.visibleMs[0],
            set: (n) => {
              level.director.visibleMs = [n, Math.round(n * 1.6)]
            },
            fmt: (n) => `${(n / 1000).toFixed(2)}s`,
          },
          {
            id: 'catcher',
            label: 'Catcher chance',
            min: 0,
            max: 80,
            step: 5,
            get: () => Math.round((level.director.catcherChance ?? 0.25) * 100),
            set: (n) => {
              level.director.catcherChance = n / 100
            },
            fmt: (n) => `${n}%`,
          },
        ],
      },
      {
        id: 'catapult',
        title: 'Catapult',
        sliders: [
          {
            id: 'power',
            label: 'Power',
            min: 3,
            max: 16,
            step: 0.1,
            get: () => level.slingshot.power,
            set: (n) => {
              level.slingshot.power = n
            },
            fmt: (n) => n.toFixed(1),
          },
          {
            id: 'pull',
            label: 'Max pull',
            min: 80,
            max: 300,
            step: 4,
            get: () => level.slingshot.maxPull,
            set: (n) => {
              level.slingshot.maxPull = n
            },
            fmt: (n) => String(Math.round(n)),
          },
          {
            id: 'gravity',
            label: 'Gravity',
            min: 400,
            max: 1800,
            step: 20,
            get: () => level.slingshot.gravity,
            set: (n) => {
              level.slingshot.gravity = n
            },
            fmt: (n) => String(Math.round(n)),
          },
          {
            id: 'ghost',
            label: 'Aim ghost',
            min: 0.1,
            max: 0.7,
            step: 0.05,
            get: () => level.slingshot.ghostT,
            set: (n) => {
              level.slingshot.ghostT = n
            },
            fmt: (n) => n.toFixed(2),
          },
        ],
      },
      {
        id: 'lives',
        title: 'Lives',
        sliders: [
          {
            id: 'lives',
            label: 'Start lives',
            min: 1,
            max: 9,
            step: 1,
            get: () => level.lives,
            set: (n) => {
              level.lives = n
            },
            fmt: (n) => String(n),
          },
          {
            id: 'bonus',
            label: 'Bonus every',
            min: 0,
            max: 20,
            step: 1,
            get: () => level.bonusEvery,
            set: (n) => {
              level.bonusEvery = n
            },
            fmt: (n) => (n <= 0 ? 'off' : String(n)),
          },
          {
            id: 'anger',
            label: 'Angry misses',
            min: 1,
            max: 10,
            step: 1,
            get: () => level.angerLimit ?? 3,
            set: (n) => {
              level.angerLimit = n
            },
            fmt: (n) => String(n),
          },
        ],
      },
    ]

    for (const section of sections) {
      this.body.appendChild(this.section(section, onChange))
    }

    head.addEventListener('click', () => {
      this.open = !this.open
      this.body.style.display = this.open ? 'block' : 'none'
      head.textContent = this.open ? '▾  GAMEPLAY' : '▸  GAMEPLAY'
    })

    document.body.appendChild(this.root)
  }

  destroy(): void {
    this.root.remove()
  }

  private section(section: Section, onChange: () => void): HTMLElement {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'border-top:1px solid #4a3a30;padding-top:6px;margin-top:6px;'
    const head = document.createElement('button')
    head.type = 'button'
    head.style.cssText =
      'width:100%;display:flex;justify-content:space-between;background:none;border:0;color:#ffe14a;font-family:Bangers,system-ui;font-size:18px;padding:4px 0;cursor:pointer;'
    const mark = document.createElement('span')
    mark.textContent = '▸'
    const name = document.createElement('span')
    name.textContent = section.title
    name.style.flex = '1'
    name.style.textAlign = 'left'
    name.style.marginLeft = '6px'
    head.append(mark, name)
    const body = document.createElement('div')
    body.style.display = 'none'
    body.style.padding = '4px 0 6px'
    for (const spec of section.sliders) {
      body.appendChild(this.row(spec, onChange))
    }
    head.addEventListener('click', () => {
      const on = !this.openSections.has(section.id)
      if (on) this.openSections.add(section.id)
      else this.openSections.delete(section.id)
      body.style.display = on ? 'block' : 'none'
      mark.textContent = on ? '▾' : '▸'
    })
    wrap.append(head, body)
    return wrap
  }

  private row(spec: Slider, onChange: () => void): HTMLElement {
    const wrap = document.createElement('label')
    wrap.style.cssText = 'display:block;margin:0 0 8px;cursor:pointer;'
    const head = document.createElement('div')
    head.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:3px;'
    const name = document.createElement('span')
    name.textContent = spec.label
    const val = document.createElement('span')
    val.textContent = spec.fmt(spec.get())
    val.style.color = '#ffe14a'
    head.append(name, val)
    const input = document.createElement('input')
    input.type = 'range'
    input.min = String(spec.min)
    input.max = String(spec.max)
    input.step = String(spec.step)
    input.value = String(spec.get())
    input.style.cssText = 'width:100%;accent-color:#e23d28;'
    input.addEventListener('input', () => {
      const n = Number(input.value)
      spec.set(n)
      val.textContent = spec.fmt(n)
      onChange()
    })
    wrap.append(head, input)
    return wrap
  }
}
