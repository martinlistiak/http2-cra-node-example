import spdy from 'spdy'
import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const PORT = 4000

const app = express()

const filesToBePushed = [
  'static/css/main.9d5b29c0.chunk.css',
  'static/js/main.e0494fc6.chunk.js',
  'static/js/2.20a9b2c2.chunk.js',
  'static/media/logo.6ce24c58.svg',
  'logo192.png',
  'favicon.ico',
  'manifest.json',
]

app.get('/', async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    if (res.push) {
      const pushFilePromises = filesToBePushed.map(async (fileName) => {
        const file = await fs.promises.readFile(`build/${fileName}`)
        const pushOptions = {
          response: {} as { 'content-type'?: string }
        }

        if (fileName.includes('.svg')) {
          pushOptions.response['content-type'] = 'image/svg+xml'
        }
        if (fileName.includes('.png')) {
          pushOptions.response['content-type'] = 'image/png'
        }

        // @ts-ignore
        return res.push(`/${fileName}`, pushOptions).end(file)
      })

      await Promise.all(pushFilePromises)
    }

    res.writeHead(200)
    res.end(await fs.promises.readFile('build/index.html'))
  } catch (err) {
    console.log(err)
  }
})

app.use(express.static(path.join(__dirname, 'build')))

spdy
  .createServer(
    {
      key: fs.readFileSync('./ssl-certificates/localhost.key'),
      cert: fs.readFileSync('./ssl-certificates/localhost.crt'),
    },
    app,
  )
  .listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
  })

export default app
