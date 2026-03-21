import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import instance from '../api/Instance';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti'

interface HeaderProps {
    setErrorAlert: (error: string) => void
    setSuccessAlert: (success: string) => void
    setStatusList: (statusList: any) => void
}

const Header = ({ setErrorAlert, setSuccessAlert, setStatusList }: HeaderProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [confetti, setConfetti] = useState(false)

    useEffect(() => {
        if (!localStorage.getItem("token")) return

        const socketNotifications = new WebSocket(import.meta.env.VITE_WS_API + "/notifications?token=" + localStorage.getItem("token")!)
        const socketStatus = new WebSocket(import.meta.env.VITE_WS_API + "/status?token=" + localStorage.getItem("token")!)

        socketNotifications.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setSuccessAlert(data.message)
            if (data.message.includes("Match with ")) {
                setConfetti(true)
                setTimeout(() => setConfetti(false), 5000)
            }
        }

        socketStatus.onmessage = (event) => {
            setStatusList(JSON.parse(event.data))
        }

        return () => {
            socketNotifications?.close()
            socketStatus?.close()
        }
    }, [navigate])

    const handleLogout = async () => {
        await instance.post('/user/logout').then(() => {
            localStorage.removeItem("token")
            navigate('/login')
        }).catch(() => {
            setErrorAlert('Could not log out the user')
        })
    }

    const showNav = location.pathname === '/' || location.pathname === '/profile'

    return (
        <>
            {confetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={1000} recycle={false} />}
            <AppBar position="static" sx={{ background: '#1a1a1a', boxShadow: 'none', borderBottom: '1px solid #2a2a2a' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <FavoriteIcon sx={{ color: '#e91e8c', mr: 1 }} />
                        <Typography variant="h6" fontWeight={700} color="white">
                            Matcha
                        </Typography>
                    </Box>
                    {showNav && (
                        <Box>
                            <IconButton onClick={() => navigate('/profile')} color="inherit">
                                <AccountCircleIcon />
                            </IconButton>
                            <IconButton onClick={handleLogout} color="inherit">
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </>
    )
}

export default Header
