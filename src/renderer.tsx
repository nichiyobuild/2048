import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>年輪 2048</title>
        <meta
          name="description"
          content="同じ数字のタイルを重ねて、年輪のように育てよう"
        />
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
        <Script src="/src/client.ts" />
      </head>
      <body class="page-gradient min-h-screen font-sans text-ink">{children}</body>
    </html>
  )
})
