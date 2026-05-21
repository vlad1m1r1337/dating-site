import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css'
import HomePage from './src/pages/Home';
import RegisterPage from './src/pages/Register';
import Header from "./src/components/Header";
import LoginPage from "./src/pages/Login";
import ValidateEmailPage from "./src/pages/ValidateEmail";
import ProfilePage from "./src/pages/Profile";
import ErrorAlert from "./src/components/ErrorAlert";
import SuccessAlert from "./src/components/SuccessAlert";
import { useState } from "react";
import ResetPasswordPage from "./src/pages/ResetPassword";
import NotFound from "./src/pages/NotFound";
import { StatusListModel } from "./src/pages/models/StatusListModel";

function App() {
  const [errorAlert, setErrorAlert] = useState<string>("")
  const [successAlert, setSuccessAlert] = useState<string>("")
  // const [statusList, setStatusList] = useState<any>([])
  const [statusList, setStatusList] = useState<StatusListModel>({
    count: 0,
    users: [],
  });

  return (
    <div style={{ height: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Router>
        <Header setStatusList={setStatusList} setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} />
        <main style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<HomePage setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} statusList={statusList} />} />
            <Route path="/register" element={<RegisterPage setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} />} />
            <Route path="/login" element={<LoginPage setErrorAlert={setErrorAlert} />} />
            <Route path="/validate-email/:id" element={<ValidateEmailPage />} />
            <Route path="/reset-password/:id" element={<ResetPasswordPage setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} />} />
            <Route path="/reset-password" element={<ResetPasswordPage setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} />} />
            <Route path="/profile" element={<ProfilePage setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer style={{ flexShrink: 0, textAlign: 'center', padding: '16px', borderTop: '1px solid #2a2a2a', color: '#666', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Matcha — 42 School Project
        </footer>
        <ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} />
        <SuccessAlert successAlert={successAlert} setSuccessAlert={setSuccessAlert} />
      </Router>
    </div>
  )
}

export default App
