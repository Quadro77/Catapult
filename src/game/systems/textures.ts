function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.add.graphics()
}

function loaded(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key) && scene.textures.get(key).key !== '__MISSING'
}

export function makeTextures(scene: Phaser.Scene): void {
  if (!loaded(scene, 'cat')) {
  const cat = gfx(scene)
  cat.fillStyle(0xf28c28)
  cat.fillTriangle(18, 26, 22, 8, 32, 24)
  cat.fillTriangle(32, 24, 42, 8, 46, 26)
  cat.fillStyle(0xe07020)
  cat.fillTriangle(20, 24, 23, 12, 30, 24)
  cat.fillTriangle(34, 24, 41, 12, 44, 24)
  cat.fillStyle(0xf28c28)
  cat.fillCircle(32, 38, 22)
  cat.fillStyle(0xfff4e0)
  cat.fillEllipse(32, 46, 22, 18)
  cat.fillStyle(0x1a1208)
  cat.fillCircle(25, 34, 3.2)
  cat.fillCircle(39, 34, 3.2)
  cat.fillStyle(0xffffff)
  cat.fillCircle(26.2, 33, 1.1)
  cat.fillCircle(40.2, 33, 1.1)
  cat.lineStyle(2, 0x1a1208)
  cat.beginPath()
  cat.arc(32, 40, 6, 0.15, Math.PI - 0.15)
  cat.strokePath()
  cat.generateTexture('cat', 64, 64)
  cat.destroy()
  }

  if (!loaded(scene, 'lady')) {
  const lady = gfx(scene)
  lady.fillStyle(0xb48ad4)
  lady.fillCircle(32, 18, 10)
  lady.fillStyle(0x8a5aaa)
  lady.fillRect(30, 8, 4, 14)
  lady.fillStyle(0xf7d2b8)
  lady.fillCircle(32, 28, 14)
  lady.fillStyle(0xf2a0c8)
  lady.fillRoundedRect(14, 42, 36, 22, 8)
  lady.fillStyle(0x1a1208)
  lady.fillCircle(26, 26, 2.2)
  lady.fillCircle(38, 26, 2.2)
  lady.lineStyle(2, 0x8aa0c8)
  lady.strokeCircle(26, 26, 5)
  lady.strokeCircle(38, 26, 5)
  lady.fillStyle(0xe23d28)
  lady.fillCircle(32, 34, 2)
  lady.generateTexture('lady', 64, 72)
  lady.destroy()
  }

  if (!loaded(scene, 'catcher')) {
  const catcher = gfx(scene)
  catcher.fillStyle(0x3a4a22)
  catcher.fillRect(20, 8, 24, 8)
  catcher.fillStyle(0xf7d2b8)
  catcher.fillCircle(32, 24, 10)
  catcher.fillStyle(0x1a1208)
  catcher.fillRect(26, 26, 12, 2)
  catcher.fillCircle(28, 22, 1.6)
  catcher.fillCircle(36, 22, 1.6)
  catcher.fillStyle(0x5a6e32)
  catcher.fillRoundedRect(16, 34, 32, 28, 6)
  catcher.lineStyle(3, 0xc8b060)
  catcher.strokeCircle(52, 18, 10)
  catcher.lineBetween(40, 28, 46, 24)
  catcher.generateTexture('catcher', 68, 68)
  catcher.destroy()
  }

  if (!loaded(scene, 'life')) {
  const life = gfx(scene)
  life.fillStyle(0xf28c28)
  life.fillCircle(12, 14, 10)
  life.fillTriangle(5, 10, 8, 2, 14, 10)
  life.fillTriangle(10, 10, 16, 2, 19, 10)
  life.fillStyle(0x1a1208)
  life.fillCircle(9, 13, 1.4)
  life.fillCircle(15, 13, 1.4)
  life.generateTexture('life', 24, 24)
  life.destroy()
  }

  const burst = gfx(scene)
  burst.fillStyle(0xffe14a)
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    burst.fillTriangle(
      24 + Math.cos(a) * 6,
      24 + Math.sin(a) * 6,
      24 + Math.cos(a - 0.35) * 22,
      24 + Math.sin(a - 0.35) * 22,
      24 + Math.cos(a + 0.35) * 22,
      24 + Math.sin(a + 0.35) * 22,
    )
  }
  burst.fillStyle(0xe23d28)
  burst.fillCircle(24, 24, 7)
  burst.generateTexture('burst', 48, 48)
  burst.destroy()
}
