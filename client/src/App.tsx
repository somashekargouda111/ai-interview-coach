import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NewInterview from './pages/NewInterview';
import InterviewPractice from './pages/InterviewPractice';
import Feedback from './pages/Feedback';
import InterviewSummary from './pages/InterviewSummary';
import History from './pages/History';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewInterview />} />
          <Route path="/history" element={<History />} />
          <Route path="/interviews/:id/practice" element={<InterviewPractice />} />
          <Route path="/interviews/:id/feedback" element={<Feedback />} />
          <Route path="/interviews/:id/summary" element={<InterviewSummary />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
