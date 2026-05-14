import AvatarPlaceholder from './AvatarPlaceholder'
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
            return <LikeList setSuccessAlert={setSuccessAlert} likesOrViews="likes" refresh={true} statusList={statusList} />
        case 'chat':
            return <Chat statusList={statusList} />
        case 'views':
            return <LikeList setSuccessAlert={setSuccessAlert} likesOrViews="views" refresh={false} statusList={statusList} />
        case 'search':
            return <Search setSuccessAlert={setSuccessAlert} setErrorAlert={setErrorAlert} statusList={statusList} />
        default:
            return (
                <>
                    <h1 className="text-center">On forge dur ici</h1>
                    <AvatarPlaceholder className="w-100" />
                </>
            )
    }
}

export default MenuContent
