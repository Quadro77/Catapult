export class EditorChrome {
  readonly root: HTMLDivElement
  private tabs: HTMLDivElement
  private addRow: HTMLDivElement

  constructor(
    labels: { id: string; label: string }[],
    activeId: string,
    onSelect: (id: string) => void,
    onNewLevel: () => void,
    artKeys: string[],
    onAddArt: (key: string) => void,
    onUpload: (file: File, asBg?: boolean) => void,
  ) {
    this.root = document.createElement('div')
    this.root.id = 'editor-chrome'
    Object.assign(this.root.style, {
      position: 'fixed',
      left: '12px',
      bottom: '12px',
      zIndex: '21',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'auto',
      fontFamily: 'Nunito, system-ui, sans-serif',
      fontSize: '13px',
      color: '#fff4e0',
    })

    this.tabs = document.createElement('div')
    this.tabs.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;max-width:520px;'
    this.root.appendChild(this.tabs)
    this.rebuildTabs(labels, activeId, onSelect, onNewLevel)

    this.addRow = document.createElement('div')
    this.addRow.style.cssText =
      'display:flex;gap:6px;align-items:center;background:rgba(26,20,16,0.88);padding:8px 10px;border-radius:8px;border:2px solid #1a1410;'
    const pick = document.createElement('select')
    pick.style.cssText = 'background:#1a1410;color:#fff4e0;border:1px solid #6a5a4a;padding:4px 6px;'
    for (const key of artKeys) {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = key
      pick.appendChild(opt)
    }
    const addBtn = document.createElement('button')
    addBtn.textContent = 'Add image'
    addBtn.style.cssText = 'background:#e23d28;color:#fff4e0;border:0;padding:6px 10px;cursor:pointer;font-family:Bangers,system-ui;font-size:16px;'
    addBtn.addEventListener('click', () => onAddArt(pick.value))
    const bgBtn = document.createElement('button')
    bgBtn.textContent = 'Set as background'
    bgBtn.style.cssText = 'background:#3a5aaa;color:#fff4e0;border:0;padding:6px 10px;cursor:pointer;font-family:Bangers,system-ui;font-size:16px;'
    bgBtn.addEventListener('click', () => onAddArt(`__bg__:${pick.value}`))
    const up = document.createElement('input')
    up.type = 'file'
    up.accept = 'image/png,image/jpeg,image/webp'
    up.style.cssText = 'color:#fff4e0;max-width:160px;'
    up.addEventListener('change', () => {
      const file = up.files?.[0]
      if (file) onUpload(file, false)
      up.value = ''
    })
    const upBg = document.createElement('input')
    upBg.type = 'file'
    upBg.accept = 'image/png,image/jpeg,image/webp'
    upBg.title = 'Replace title background (full screen)'
    upBg.style.cssText = 'color:#fff4e0;max-width:130px;'
    const bgLab = document.createElement('span')
    bgLab.textContent = 'BG'
    upBg.addEventListener('change', () => {
      const file = upBg.files?.[0]
      if (file) onUpload(file, true)
      upBg.value = ''
    })
    this.addRow.append(pick, addBtn, bgBtn, up, bgLab, upBg)
    this.root.appendChild(this.addRow)
    document.body.appendChild(this.root)
  }

  rebuildTabs(
    labels: { id: string; label: string }[],
    activeId: string,
    onSelect: (id: string) => void,
    onNewLevel: () => void,
  ): void {
    this.tabs.replaceChildren()
    for (const item of labels) {
      const btn = document.createElement('button')
      btn.textContent = item.label
      const on = item.id === activeId
      btn.style.cssText = `border:0;padding:7px 12px;cursor:pointer;font-family:Bangers,system-ui;font-size:18px;background:${on ? '#e23d28' : '#3a5aaa'};color:#fff4e0;`
      btn.addEventListener('click', () => onSelect(item.id))
      this.tabs.appendChild(btn)
    }
    const plus = document.createElement('button')
    plus.textContent = '+ Level'
    plus.style.cssText =
      'border:0;padding:7px 12px;cursor:pointer;font-family:Bangers,system-ui;font-size:18px;background:#2d8a2d;color:#fff4e0;'
    plus.addEventListener('click', onNewLevel)
    this.tabs.appendChild(plus)
  }

  setAddVisible(on: boolean): void {
    this.addRow.style.display = on ? 'flex' : 'none'
  }

  destroy(): void {
    this.root.remove()
  }
}
