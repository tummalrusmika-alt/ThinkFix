 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Join from './student/Join'
import Solve from './student/Solve'
import Result from './student/Result'
import Learn from './student/Learn'
import FixBuddy from './student/FixBuddy'
import Test from './student/Test'
import Fingerprint from './student/Fingerprint'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/join" replace />} />
        <Route path="/join" element={<Join />} />
        <Route path="/solve" element={<Solve />} />
        <Route path="/result" element={<Result />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/buddy" element={<FixBuddy />} />
        <Route path="/test" element={<Test />} />
        <Route path="/fingerprint" element={<Fingerprint />} />
      </Routes>
    </BrowserRouter>
  )
}