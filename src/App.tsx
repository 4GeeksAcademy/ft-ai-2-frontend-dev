import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SecretPage } from './pages/SecretPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/secret" element={<SecretPage />} />
      </Routes>
    </BrowserRouter>
  )
}
