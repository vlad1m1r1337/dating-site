import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import instance from '../api/Instance';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti'
import { StatusListModel } from '../pages/models/StatusListModel';

interface HeaderProps {
    setErrorAlert: (error: string) => void
    setSuccessAlert: (success: string) => void
    setStatusList: (statusList: StatusListModel) => void
}

const Header = ({ setErrorAlert, setSuccessAlert, setStatusList }: HeaderProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isConfettiVisible, setIsConfettiVisible] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setStatusList({ count: 0, users: [] })
            return
        }

        let shouldCloseSockets = false
        let socketNotifications: WebSocket | undefined
        let socketStatus: WebSocket | undefined

        const handleInvalidSession = () => {
            localStorage.removeItem("token")
            setStatusList({ count: 0, users: [] })

            const shouldRedirectToLogin = location.pathname === '/' || location.pathname === '/profile'
            if (shouldRedirectToLogin) {
                navigate('/login')
            }
        }

        const connectSockets = async () => {
            try {
                await instance.get('/user/session')
            } catch {
                if (!shouldCloseSockets) handleInvalidSession()
                return
            }

            if (shouldCloseSockets) return

            const websocketToken = encodeURIComponent(token)
            socketNotifications = new WebSocket(`${import.meta.env.VITE_WS_API}/notifications?token=${websocketToken}`)
            socketStatus = new WebSocket(`${import.meta.env.VITE_WS_API}/status?token=${websocketToken}`)

            socketNotifications.onmessage = (event) => {
                const data = JSON.parse(event.data)
                setSuccessAlert(data.message)
                if (data.message.includes("Match with ")) {
                    setIsConfettiVisible(true)
                    setTimeout(() => setIsConfettiVisible(false), 5000)
                }
            }

            socketStatus.onmessage = (event) => {
                setStatusList(JSON.parse(event.data))
            }
        }

        connectSockets()

        return () => {
            shouldCloseSockets = true
            socketNotifications?.close()
            socketStatus?.close()
        }
    }, [location.pathname, navigate, setStatusList, setSuccessAlert])

    const handleLogout = async () => {
        await instance.post('/user/logout').then(() => {
            localStorage.removeItem("token")
            navigate('/login')
        }).catch(() => {
            setErrorAlert('Could not log out the user')
        })
    }

    const shouldShowNav = location.pathname === '/' || location.pathname === '/profile'

    return (
        <>
            {isConfettiVisible && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={1000} recycle={false} />}
            <AppBar position="static" sx={{ background: '#1a1a1a', boxShadow: 'none', borderBottom: '1px solid #2a2a2a' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <FavoriteIcon sx={{ color: '#e91e8c', mr: 1 }} />
                        <Typography variant="h6" fontWeight={700} color="white">
                            Matcha
                        </Typography>
                    </Box>
                    {shouldShowNav && (
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
