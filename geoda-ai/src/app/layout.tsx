export const metadata = {
  title: 'GeoDa.AI',
  description: 'Powered by GeoDa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
