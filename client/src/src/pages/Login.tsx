import { TextField, Typography, Link, Box, Paper } from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useState } from "react"
import { LoginForm } from "./models/LoginForm"
import instance from "../api/Instance"
import { useNavigate } from "react-router-dom"

interface LoginPageProps {
    setErrorAlert: (message: string) => void
}

const LoginPage = ({ setErrorAlert }: LoginPageProps) => {
    const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [event.target.id]: event.target.value })
    }

    useEffect(() => {
        const checkLoggedIn = async () => {
            await instance.get('/user/session').then(() => {
                navigate('/')
            }).catch(() => {
                localStorage.removeItem("token")
            })
        }
        if (localStorage.getItem("token")) checkLoggedIn()
    }, [navigate])

    const handleSubmit = () => {
        if (!localStorage.getItem("token")) {
            setIsLoading(true)
            instance.post('/user/login', form).then((res) => {
                localStorage.setItem("token", res.data.token)
                navigate('/')
            }).catch((err) => {
                setErrorAlert(err.response.data.message)
            }).finally(() => {
                setIsLoading(false)
            })
        }
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 4, background: '#1a1a1a' }}>
                <Typography variant="h5" fontWeight={700} textAlign="center" mb={3} color="primary">
                    Welcome back 💘
                </Typography>
                <TextField
                    value={form.username}
                    onChange={handleFieldChange}
                    disabled={isLoading}
                    fullWidth
                    required
                    id="username"
                    label="Username"
                    variant="outlined"
                    sx={{ mb: 2 }}
                    inputProps={{ maxLength: 16 }}
                />
                <TextField
                    value={form.password}
                    onChange={handleFieldChange}
                    disabled={isLoading}
                    fullWidth
                    required
                    id="password"
                    type="password"
                    label="Password"
                    variant="outlined"
                    sx={{ mb: 3 }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                    inputProps={{ maxLength: 30 }}
                />
                <LoadingButton
                    variant="contained"
                    loading={isLoading}
                    fullWidth
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    sx={{ mb: 2 }}
                >
                    Login
                </LoadingButton>
                <Typography textAlign="center" variant="body2" color="text.secondary">
                    New here?{' '}
                    <Link onClick={() => navigate("/register")} sx={{ cursor: 'pointer' }} color="primary">
                        Register
                    </Link>
                </Typography>
                <Typography textAlign="center" variant="body2" color="text.secondary" mt={1}>
                    Forgot password?{' '}
                    <Link onClick={() => navigate("/reset-password")} sx={{ cursor: 'pointer' }} color="primary">
                        Reset
                    </Link>
                </Typography>
            </Paper>
        </Box>
    )
}

export default LoginPage
