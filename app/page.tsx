import dynamic from 'next/dynamic'

export const revalidate = 0

const GoldenHourApp = dynamic(() => import('./sections/GoldenHourApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(220 25% 7%)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p style={{ color: 'hsl(220 12% 55%)' }} className="text-sm">Loading Golden Hour...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <GoldenHourApp />
}
