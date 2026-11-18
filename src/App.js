import { Routes, Route } from 'react-router-dom'
import F1Site from './f1/F1Site.jsx'

// One page. Old links like /about or /contact still work: they drive the car
// straight to that part of the circuit.
function App() {
  return (
    <Routes>
      <Route path="*" element={<F1Site />} />
    </Routes>
  )
}

export default App
