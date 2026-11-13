import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import IntroGate from './components/IntroGate.jsx'
import { shouldShowIntro } from './lib/intro.js'
import Layout from './components/Layout.jsx'
import RequireMember from './components/RequireMember.jsx'
import Home from './pages/Home.jsx'
import Join from './pages/Join.jsx'
import Routine from './pages/Routine.jsx'
import Subscribe from './pages/Subscribe.jsx'

function App() {
  const [showIntro, setShowIntro] = useState(shouldShowIntro)

  return (
    <>
      {showIntro && <IntroGate onDone={() => setShowIntro(false)} />}
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route
          path="/routine"
          element={
            <RequireMember>
              <Routine />
            </RequireMember>
          }
        />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
  )
}

export default App
