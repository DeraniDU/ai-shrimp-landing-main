import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import ManualInput from './pages/ManualInput'
import CSVUpload from './pages/CSVUpload'
import Analytics from './pages/Analytics'
import History from './pages/History'
import AdvancedPrediction from './pages/AdvancedPrediction'

export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Shrimp Farm — Water Quality</h1>
            <nav className="space-x-4 text-sm">
              <Link to="/" className="text-slate-700 hover:underline">Overview</Link>
              <Link to="/manual" className="text-slate-700 hover:underline">Manual Input</Link>
              <Link to="/csv" className="text-slate-700 hover:underline">CSV Upload</Link>
              <Link to="/analytics" className="text-slate-700 hover:underline">Analytics</Link>
              <Link to="/history" className="text-slate-700 hover:underline">History</Link>
              <Link to="/advanced" className="text-slate-700 hover:underline">Advanced</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/manual" element={<ManualInput/>} />
            <Route path="/csv" element={<CSVUpload/>} />
            <Route path="/analytics" element={<Analytics/>} />
            <Route path="/history" element={<History/>} />
            <Route path="/advanced" element={<AdvancedPrediction/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
