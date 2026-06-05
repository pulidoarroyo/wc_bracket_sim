import Navbar from '@/components/Navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}