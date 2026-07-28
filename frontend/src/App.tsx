import { Search, Settings, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'

import './App.css'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-4">
        <Search size={20} />

        <Settings
          size={20}
          className="text-gray-600"
        />

        <Sprout
          size={24}
          className="text-green-600"
        />
      </div>

      <Button>
        Test shadcn Button
      </Button>

      <Button variant="outline">
        Outline Button
      </Button>

      <Button variant="destructive">
        Delete
      </Button>
    </div>
  )
}

export default App