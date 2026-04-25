import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Chatbot from '@/components/Chatbot'

export const metadata: Metadata = {
  title: 'NAT888 — ร้านขายไอดีเกมอันดับ 1',
  description: 'สกิน • ไอดี • สุ่มกล่อง ราคาถูก ส่งไว ปลอดภัย 100%',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </div>
        <footer style={{ background: 'var(--dark2)', borderTop: '1px solid var(--border)', textAlign: 'center', padding: '24px', fontSize: '13px', color: 'var(--muted)', lineHeight: 2 }}>
          <p><strong style={{ color: 'var(--gold)' }}>NAT888</strong> — ร้านขายไอดีเกมอันดับ 1</p>
          <p>ติดต่อ: Line <strong style={{ color: 'var(--gold)' }}>@nat888</strong> | Facebook: <strong style={{ color: 'var(--gold)' }}>NAT888 Shop</strong></p>
        </footer>
        <Chatbot />
      </body>
    </html>
  )
}
