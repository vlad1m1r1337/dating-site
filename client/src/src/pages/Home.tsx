import { useEffect, useState } from "react"
import instance from "../api/Instance"
import { useNavigate } from "react-router-dom"
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Card, CircularProgress } from "@mui/material"
import { StatusListModel } from "./models/StatusListModel";
import MenuContent from "../components/MenuContent";

interface HomePageProps {
    setErrorAlert: (message: string) => void
    setSuccessAlert: (message: string) => void
    statusList: StatusListModel
}

const HomePage = ({ setErrorAlert, setSuccessAlert, statusList }: HomePageProps) => {
    const [menuValue, setMenuValue] = useState('discover');
    const [isPageLoading, setIsPageLoading] = useState(true)
    const navigate = useNavigate()

    const handleMenuChange = (_event: React.SyntheticEvent, newValue: string) => {
        setMenuValue(newValue);
    };
    useEffect(() => {
        const checkLoggedIn = async () => {
            await instance.get('/user/session').then(() => {
                setIsPageLoading(false)
            }
            ).catch(() => {
                localStorage.removeItem("token")
                navigate('/login')
            })
        }

        if (localStorage.getItem("token")) {
            checkLoggedIn()
        }
        else {
            navigate('/login')
        }
    }, [navigate])

    return (
        <div className="homePage container">
            {isPageLoading ? <CircularProgress color="secondary" /> :
                <div className="homePageContent">
                    <Card className="col-xs-12 col-sm-12 col-md-10 col-lg-8 col-xl-6 col-xxl-5 pt-3 position-relative d-flex" elevation={6} style={{ height: "400px", minHeight: 0, maxHeight: "50svh", marginTop: "14px", boxShadow: "8px 8px 10px #000000", overflow: "scroll", flexDirection: "column" }}>
                        <div className="homePageCardContent">
                            <MenuContent menuValue={menuValue} setErrorAlert={setErrorAlert} setSuccessAlert={setSuccessAlert} statusList={statusList} />
                        </div>
                        <BottomNavigation sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: "flex" }} value={menuValue} onChange={handleMenuChange} showLabels={false}>
                            <BottomNavigationAction
                                value="discover"
                                icon={<HomeIcon color={menuValue === 'discover' ? 'secondary' : 'primary'} />}
                                style={{ minWidth: 0 }}
                            />
                            <BottomNavigationAction
                                value="search"
                                icon={<SearchIcon color={menuValue === 'search' ? 'secondary' : 'primary'} />}
                                style={{ minWidth: 0 }}
                            />
                            <BottomNavigationAction
                                value="likes"
                                icon={<FavoriteIcon color={menuValue === 'likes' ? 'secondary' : 'primary'} />}
                                style={{ minWidth: 0 }}
                            />
                            <BottomNavigationAction
                                value="views"
                                icon={<VisibilityIcon color={menuValue === 'views' ? 'secondary' : 'primary'} />}
                                style={{ minWidth: 0 }}
                            />
                            <BottomNavigationAction
                                value="chat"
                                icon={<ChatRoundedIcon color={menuValue === 'chat' ? 'secondary' : 'primary'} />}
                                style={{ minWidth: 0 }}
                            />
                        </BottomNavigation>
                    </Card>
                </div>
            }
        </div>
    )
}

export default HomePage