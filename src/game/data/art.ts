export type ArtFile = {
  file: string
  key: string
  chroma: boolean
}

export const ART_FILES: ArtFile[] = [
  { file: 'assets/originals/lady-peek.png', key: 'lady', chroma: false },
  { file: 'assets/lady-catch.jpg', key: 'lady-catch', chroma: true },
  { file: 'assets/originals/lady-celebrate.png', key: 'lady-celebrate', chroma: false },
  { file: 'assets/originals/dog-catcher.png', key: 'catcher', chroma: false },
  { file: 'assets/originals/cat-catcher-cat-caught.png', key: 'catcher-gotcha', chroma: false },
  { file: 'assets/slingshot-frame.png', key: 'slingshot', chroma: false },
  { file: 'assets/Title.png', key: 'ui-title', chroma: false },
  { file: 'assets/Building.jpg', key: 'bg-building', chroma: false },
  { file: 'assets/adobe.jpg', key: 'bg-adobe', chroma: false },
  { file: 'assets/machiya.jpg', key: 'bg-machiya', chroma: false },
  { file: 'assets/chalet.jpg', key: 'bg-chalet', chroma: false },
  { file: 'assets/chateau.jpg', key: 'bg-chateau', chroma: false },
  { file: 'assets/palace.jpg', key: 'bg-palace', chroma: false },
  { file: 'assets/cat-lives.png', key: 'life', chroma: false },
  { file: 'assets/originals/cat-flying.png', key: 'cat-fly', chroma: false },
  { file: 'assets/originals/cat-catapult.png', key: 'cat', chroma: false },
  { file: 'assets/title/lady-peek.png', key: 'title-lady', chroma: false },
  { file: 'assets/title/slingshot-frame.png', key: 'title-sling', chroma: false },
  { file: 'assets/title/cat-flying.png', key: 'title-cat-fly', chroma: false },
]
