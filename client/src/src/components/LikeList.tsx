import { Avatar, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Button } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import goose from '../../assets/goose.jpg'
import instance from "../api/Instance"
import { LikeModel } from "./models/LikeModel"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ProfileViewer from "./ProfileViewer"
import CloseIcon from '@mui/icons-material/Close';
import { StatusListModel } from "../pages/models/StatusListModel"
import AvatarPlaceholder from './AvatarPlaceholder'

interface LikeListProps {
    setSuccessAlert: (message: string) => void
    likesOrViews: "likes" | "views"
    refresh: boolean
    statusList: StatusListModel
}

const LikeList = ({ setSuccessAlert, likesOrViews, refresh, statusList }: LikeListProps) => {

    const [likes, setLikes] = useState<LikeModel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [profileId, setProfileId] = useState<string | null>(null)
    const [isHandlingInteraction, setIsHandlingInteraction] = useState(false)

    const getAvatarSrc = (image?: string) => {
        if (!image) {
            return goose
        }

        return `${import.meta.env.VITE_URL_API}/image/${image}`
    }

    const getLikes = useCallback(async () => {
        setIsLoading(true)
        await instance.get<LikeModel[]>(likesOrViews === "likes" ? '/user/likes' : '/user/views').then((res) => {
            setLikes(res.data)
        }).catch(() => {
            setLikes([])
        }).finally(() => {
            setIsLoading(false)
            setProfileId(null)
        })
    }, [likesOrViews])

    const likeProfile = async (profileIdToLike: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToLike}/like`).then(() => {
        }).catch(() => {
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const skipProfile = async (profileIdToSkip: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToSkip}/skip`).then(() => {
        }).catch(() => {
            setProfileId(null)
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const reportProfile = async (profileIdToReport: string, message: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToReport}/report`, {
            message: message
        }).then(() => {
            getLikes()
            setSuccessAlert('Profile reported')
        }).catch(() => {
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const blockProfile = async (profileIdToBlock: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToBlock}/block`).then(() => {
            getLikes()
            setSuccessAlert('Profile blocked')
        }).catch(() => {
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const unblockProfile = async (profileIdToUnblock: string) => {
        setIsHandlingInteraction(true)
        await instance.delete(`/user/${profileIdToUnblock}/block`).then(() => {
        }).catch(() => {
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const unlikeProfile = async (profileIdToUnlike: string) => {
        setIsHandlingInteraction(true)
        await instance.delete(`/user/${profileIdToUnlike}/like`).then(() => {
            getLikes()
        }).catch(() => {
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const previousProfile = () => {
        const currentIndex = likes.findIndex(like => like.id === profileId)
        const nextIndex = currentIndex <= 0 ? likes.length - 1 : currentIndex - 1
        setProfileId(likes[nextIndex]?.id || null)
    }

    const nextProfile = () => {
        const currentIndex = likes.findIndex(like => like.id === profileId)
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % likes.length
        setProfileId(likes[nextIndex]?.id || null)
    }

    useEffect(() => {
        getLikes()
    }, [getLikes, refresh])

    const renderList = () => {
        if (isLoading) {
            return (
                <div className="skeletonHeight">
                    <CircularProgress color="secondary" />
                </div>
            )
        }

        if (!likes.length) {
            return (
                <div className="skeletonHeight display-flex flex-column position-relative">
                    <AvatarPlaceholder className="w-100" />
                </div>
            )
        }

        return (
            <List className="likeList">
                {likes.map((like: LikeModel) => (
                    <div className="likeListItemParent col-12 col-md-6" key={like.id}>
                        <ListItem alignItems="center" className="likeListItem w-100" onClick={() => { setProfileId(like.id) }}>
                            <ListItemAvatar>
                                <Avatar alt={like.firstName || "Avatar"} src={getAvatarSrc(like.image)} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={like.firstName || ""}
                                secondary={like.age || ""}
                            />
                            <KeyboardArrowRightIcon />
                        </ListItem>
                    </div>
                ))}
            </List>
        )
    }

    return (
        <div className="likeListParent w-100 h-100">
            {profileId && (
                <>
                    <Button className="closeButton" onClick={() => { setProfileId(null) }} title="Close">
                        <CloseIcon color="primary" />
                    </Button>
                    <ProfileViewer
                        profileToGetId={profileId}
                        likeProfile={likeProfile}
                        skipProfile={skipProfile}
                        reportProfile={reportProfile}
                        blockProfile={blockProfile}
                        unblockProfile={unblockProfile}
                        unlikeProfile={unlikeProfile}
                        statusList={statusList}
                        isHandlingInteraction={isHandlingInteraction}
                        previousProfile={previousProfile}
                        nextProfile={nextProfile}
                    />
                </>
            )}
            {!profileId && renderList()}
        </div>
    )
}

export default LikeList