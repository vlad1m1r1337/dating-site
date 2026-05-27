import { useCallback, useEffect, useRef, useState } from "react"
import instance from "../api/Instance"
import { CircularProgress } from "@mui/material"
import { ChatMessage, ChatModel, ChatRoom } from "./models/ChatModel"
import { StatusListModel } from "../pages/models/StatusListModel";
import AvatarPlaceholder from './AvatarPlaceholder'
import ChatRoomList from "./chat/chat-room-list"
import ChatRoomView from "./chat/chat-room-view"

interface ChatProps {
    statusList: StatusListModel
}
const Chat = ({ statusList }: ChatProps) => {
    const [data, setData] = useState<ChatModel>()
    const [roomSelected, setRoomSelected] = useState<ChatRoom>()
    const [messageText, setMessageText] = useState('')
    const chatBoxRef = useRef<HTMLDivElement>(null)

    const getChat = useCallback(async () => {
        await instance.get<ChatModel>('/chat').then((res) => {
            setData(res.data)
        }).catch(() => {
            setData(undefined)
        })
    }, [])

    const handleSocketMessage = useCallback((event: MessageEvent) => {
        let message: ChatMessage | null = null
        try {
            message = JSON.parse(event.data)
        } catch {
            return
        }

        setRoomSelected((room) => {
            if (!room || !message || message.id !== room.id) {
                return room
            }

            return {
                ...room,
                messages: [...room.messages, message],
            }
        })
    }, [])

    const postMessage = useCallback(async () => {
        if (!roomSelected) return
        const content = messageText.trim()
        if (!content) return

        setMessageText('')
        await instance.post(`/chat/${roomSelected.id}/message`, { content }).catch(() => {
            setMessageText(content)
        })
    }, [messageText, roomSelected])

    const closeRoom = useCallback(() => {
        setRoomSelected(undefined)
        getChat()
    }, [getChat])

    useEffect(() => {
        getChat()
    }, [getChat])

    useEffect(() => {
        const socketChat = new WebSocket(`${import.meta.env.VITE_WS_API}/chat?token=${localStorage.getItem("token")}`)
        socketChat.onmessage = handleSocketMessage

        return () => {
            socketChat.close()
        }
    }, [handleSocketMessage])

    useEffect(() => {
        chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight)
    }, [roomSelected])

    const renderContent = () => {
        if (roomSelected) {
            return (
                <ChatRoomView
                    room={roomSelected}
                    statusList={statusList}
                    chatBoxRef={chatBoxRef}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    closeRoom={closeRoom}
                    postMessage={postMessage}
                />
            )
        }

        if (data && data.rooms.length) {
            return (
                <ChatRoomList
                    rooms={data.rooms}
                    statusList={statusList}
                    selectRoom={setRoomSelected}
                />
            )
        }

        if (!data) {
            return (
                <div className="skeletonHeight">
                    <CircularProgress color="secondary" />
                </div>
            )
        }

        return (
            <div className="skeletonHeight display-flex flex-column position-relative">
                <AvatarPlaceholder className="w-100" />
            </div>
        )
    }

    return (
        <div className="chatParent w-100 h-100">
            {renderContent()}
        </div>
    )
}

export default Chat