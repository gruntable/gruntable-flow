import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from './features/home/HomePage.jsx'
import Workspace from './features/workspace/Workspace.jsx'

function HomePageWrapper() {
  const navigate = useNavigate()
  return <HomePage onNavigateToWorkspace={() => navigate('/workspace')} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/home" element={<HomePageWrapper />} />
        <Route path="/workspace" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
