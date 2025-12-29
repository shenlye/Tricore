import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { posts } from './db/schema';
import { eq } from 'drizzle-orm'

const db = drizzle(process.env.DB_FILE_NAME!)

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug')

  const result = await db.select().from(posts).where(eq(posts.slug, slug))

  return c.json({
    data: result[0],
  })
})

app.get('/posts', async (c) => {
  const limit = 10
  const page = Number(c.req.query('page') || '1')

  const result = await db.select().from(posts).limit(limit).offset((page - 1) * limit)

  return c.json({
    data: result,
  })
})

app.post('/posts', async (c) => {
  const adminSecretKey = c.req.header('Authorization')
  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY || !adminSecretKey) {
    return c.json({
      error: 'Unauthorized',
    }, 401)
  }

  try {
    const { title, content, slug } = await c.req.json()
    const result = await db.insert(posts).values({
      title: title,
      content: content,
      slug: slug,
    }).returning()

    return c.json({
      message: '文章发布成功',
      data: result[0],
    }, 201)
  } catch (error) {
    return c.json({
      error: '文章发布失败',
    }, 400)
  }
})
export default app
