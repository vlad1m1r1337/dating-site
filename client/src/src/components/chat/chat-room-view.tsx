import { RefObject } from 'react'
import { Avatar, Box, Button, Paper, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import goose from '../../../assets/goose.jpg'
import { ChatRoom } from '../models/ChatModel'
import { StatusListModel } from '../../pages/models/StatusListModel'
import OnlineBadge from './online-badge'

interface ChatRoomViewProps {
    room: ChatRoom
    statusList: StatusListModel
    chatBoxRef: RefObject<HTMLDivElement>
    messageText: string
    setMessageText: (value: string) => void
    closeRoom: () => void
    postMessage: () => Promise<void>
}

const getAvatarSrc = (image?: string) => {
    if (!image) {
        return goose
    }

    return `${import.meta.env.VITE_URL_API}/image/${image}`
}

const ChatRoomView = ({
    room,
    statusList,
    chatBoxRef,
    messageText,
    setMessageText,
    closeRoom,
    postMessage,
}: ChatRoomViewProps) => {
    const isUserOnline = statusList?.users?.includes(room.user_2?.id)

    return (
        <div className="chatChannel">
            <div className="d-flex justify-content-between w-100 mb-2">
                <div className="d-flex align-items-center text-truncate">
                    <OnlineBadge
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        sx={{ padding: '0 0 2px 2px' }}
                        overlap="circular"
                        badgeContent=" "
                        invisible={!isUserOnline}
                    >
                        <Avatar alt={room.user_2?.firstName || 'Avatar'} src={getAvatarSrc(room.user_2?.image)} />
                    </OnlineBadge>
                    <Typography ml={1} variant="h6" fontWeight="bold">{room.user_2?.firstName}</Typography>
                </div>
                <Button className="closeButton" onClick={closeRoom} title="Close">
                    <CloseIcon color="primary" />
                </Button>
            </div>
            <Box
                className="chatBox"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'grey.200',
                    borderRadius: '6px',
                }}
            >
                <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto', p: 2 }} ref={chatBoxRef}>
                    {room.messages.map((message) => {
                        const isPeerMessage = message.user_id === room.user_2.id
                        const avatarSrc = isPeerMessage ? getAvatarSrc(room.user_2?.image) : getAvatarSrc(room.user_1?.image)

                        return (
                            <Box
                                key={message.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isPeerMessage ? 'flex-start' : 'flex-end',
                                    mb: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: isPeerMessage ? 'row' : 'row-reverse',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Avatar src={avatarSrc} />
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1,
                                            ml: isPeerMessage ? 1 : 0,
                                            mr: isPeerMessage ? 0 : 1,
                                            backgroundColor: isPeerMessage ? 'primary.light' : 'secondary.light',
                                            borderRadius: isPeerMessage ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
                                        }}
                                    >
                                        <Typography sx={{ wordBreak: 'break-all' }} variant="body1">{message.content}</Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
                <Box sx={{ p: 2, display: 'flex' }}>
                    <TextField
                        size="small"
                        fullWidth
                        inputProps={{ maxLength: 400 }}
                        placeholder="Type a message"
                        variant="outlined"
                        sx={{
                            '& .MuiInputBase-input': { color: '#000' },
                            '& .MuiInputBase-input::placeholder': { color: '#000', opacity: 1 },
                            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                        }}
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={async (event) => {
                            if (event.key === 'Enter') {
                                await postMessage()
                            }
                        }}
                    />
                    <Button
                        fullWidth
                        color="primary"
                        variant="contained"
                        endIcon={<SendIcon />}
                        style={{ marginLeft: '4px', width: '100px' }}
                        onClick={postMessage}
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </div>
    )
}

export default ChatRoomView
