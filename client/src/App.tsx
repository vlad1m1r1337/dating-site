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

function App() {
  const [errorAlert, setErrorAlert] = useState<string>("")
  const [successAlert, setSuccessAlert] = useState<string>("")
  const [statusList, setStatusList] = useState<any>([])

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Router>
        <Header setStatusList={setStatusList} setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} />
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
        <ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} />
        <SuccessAlert successAlert={successAlert} setSuccessAlert={setSuccessAlert} />
      </Router>
    </div>
  )
}

export default App
