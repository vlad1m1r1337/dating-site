import LikeList from './LikeList'
import Chat from './Chat'
import Browsing from './Browsing'
import Search from './Search'
import { StatusListModel } from '../pages/models/StatusListModel'

interface MenuContentProps {
    menuValue: string
    setErrorAlert: (message: string) => void
    setSuccessAlert: (message: string) => void
    statusList: StatusListModel
}

const MenuContent = ({ menuValue, setErrorAlert, setSuccessAlert, statusList }: MenuContentProps) => {
    switch (menuValue) {
        case 'discover':
            return <Browsing setSuccessAlert={setSuccessAlert} setErrorAlert={setErrorAlert} statusList={statusList} />
        case 'likes':
        case 'views':
            return <LikeList setSuccessAlert={setSuccessAlert} likesOrViews={menuValue === 'likes' ? 'likes' : 'views'} refresh={menuValue === 'likes'} statusList={statusList} />
        case 'chat':
            return <Chat statusList={statusList} />
        case 'search':
            return <Search setSuccessAlert={setSuccessAlert} setErrorAlert={setErrorAlert} statusList={statusList} />
        default:
            return null
    }
}

export default MenuContent
