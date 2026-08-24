export class EditorChrome {
  readonly root: HTMLDivElement
  private tabs: HTMLDivElement

  constructor(
    labels: { id: string; label: string }[],
    activeId: string,
    onSelect: (id: string) => void,
    onNewLevel: () => void,
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

  destroy(): void {
    this.root.remove()
  }
}
