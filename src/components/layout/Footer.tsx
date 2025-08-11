export const Footer = () => (
    <footer className="bg-page-section-bg border-t border-gray-100 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Neurodivergent Designed
            </span>
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Evidence-Based
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Accessibility First
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy">Privacy</Link>
            <Link href="/support">Support</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-400 mt-4">
          Built for neurodivergent learners | UDL Aligned | Research-Based Design
        </div>
      </div>
    </footer>
  )