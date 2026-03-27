import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from './pages/home/HomePage.jsx'
import Workflow from './pages/workflow/Workflow.jsx'
import TemplatePage from './pages/templates/TemplatePage.jsx'

function HomePageWrapper() {
  const navigate = useNavigate()
  const navigateToWorkflow = (workflowId) =>
    navigate(workflowId ? `/workflow?id=${workflowId}` : '/workflow')
  return <HomePage onNavigateToWorkflow={navigateToWorkflow} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Workflow />} />
        <Route path="/home" element={<HomePageWrapper />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/templates/:id" element={<TemplatePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
