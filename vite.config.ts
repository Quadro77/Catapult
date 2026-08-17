import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function editorSave(): Plugin {
  return {
    name: 'editor-save',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__editor/')) return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('POST only')
          return
        }
        try {
          const body = await readBody(req)
          if (req.url === '/__editor/save') {
            const dest = join(root, 'public', 'editor', 'project-save.json')
            mkdirSync(dirname(dest), { recursive: true })
            const parsed = JSON.parse(body) as unknown
            writeFileSync(dest, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, file: 'public/editor/project-save.json' }))
            return
          }
          if (req.url === '/__editor/image') {
            const payload = JSON.parse(body) as { key?: string; dataUrl?: string; name?: string }
            const raw = payload.dataUrl ?? ''
            const comma = raw.indexOf(',')
            const b64 = comma >= 0 ? raw.slice(comma + 1) : raw
            const header = comma >= 0 ? raw.slice(0, comma) : ''
            const ext = header.includes('png') ? 'png' : header.includes('webp') ? 'webp' : 'jpg'
            const key = (payload.key ?? `user-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '')
            const file = `assets/user/${key}.${ext}`
            const dest = join(root, 'public', 'assets', 'user', `${key}.${ext}`)
            mkdirSync(dirname(dest), { recursive: true })
            writeFileSync(dest, Buffer.from(b64, 'base64'))
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, key, file }))
            return
          }
          next()
        } catch (err) {
          res.statusCode = 500
          res.end(String(err))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [editorSave()],
  server: {
    host: true,
    port: 5173,
  },
})
