import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import goose from '../../../assets/goose.jpg'
import { ChatRoom } from '../models/ChatModel'
import { StatusListModel } from '../../pages/models/StatusListModel'
import OnlineBadge from './online-badge'

interface ChatRoomListProps {
    rooms: ChatRoom[]
    statusList: StatusListModel
    selectRoom: (room: ChatRoom) => void
}

const getAvatarSrc = (image?: string) => {
    if (!image) {
        return goose
    }

    return `${import.meta.env.VITE_URL_API}/image/${image}`
}

const ChatRoomList = ({ rooms, statusList, selectRoom }: ChatRoomListProps) => {
    return (
        <List className="chatList">
            {rooms.map((room) => {
                const isUserOnline = statusList?.users?.includes(room?.user_2?.id)
                const lastMessage = room.messages?.length
                    ? room.messages[room.messages.length - 1].content
                    : 'Say hi to your match!'

                return (
                    <div className="chatListItemParent w-100" key={room.id}>
                        <ListItem alignItems="center" className="chatListItem w-100" onClick={() => selectRoom(room)}>
                            <ListItemAvatar>
                                <OnlineBadge
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    overlap="circular"
                                    badgeContent=" "
                                    sx={{ padding: '0 0 4px 4px' }}
                                    invisible={!isUserOnline}
                                >
                                    <Avatar alt={room.user_2?.firstName || 'Avatar'} src={getAvatarSrc(room.user_2?.image)} />
                                </OnlineBadge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={room.user_2?.firstName || ''}
                                secondary={lastMessage}
                            />
                            <KeyboardArrowRightIcon />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </div>
                )
            })}
        </List>
    )
}

export default ChatRoomList
