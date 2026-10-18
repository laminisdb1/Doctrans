import { Suspense } from 'react'
import Doctrans from "./doctrans";

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement…</div>}>
      <Doctrans />
    </Suspense>
  )
}
export default App