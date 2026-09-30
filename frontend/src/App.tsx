import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Analytics from './pages/Analytics'
import Home from './pages/Home'
import UrlDetails from './pages/UrlDetails'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="analytics/:code" element={<UrlDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
