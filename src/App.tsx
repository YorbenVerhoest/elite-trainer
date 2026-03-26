import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { TrainerPage } from '@/pages/TrainerPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { WorkoutDetailPage } from '@/pages/WorkoutDetailPage'
import { AccountPage } from '@/pages/AccountPage'
import { ProfileTab } from '@/components/account/ProfileTab'
import { HistoryTab } from '@/components/account/HistoryTab'
import { ProgramsTab } from '@/components/account/ProgramsTab'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<AuthGuard />}>
            <Route path="/" element={<TrainerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:id" element={<WorkoutDetailPage />} />

            <Route path="/account" element={<AccountPage />}>
              <Route path="profile"  element={<ProfileTab />} />
              <Route path="history"  element={<HistoryTab />} />
              <Route path="programs" element={<ProgramsTab />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
