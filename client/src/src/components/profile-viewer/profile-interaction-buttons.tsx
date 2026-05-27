import { Button } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import ClearIcon from '@mui/icons-material/Clear'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HeartBrokenIcon from '@mui/icons-material/HeartBroken'
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend'
import { ProfileModel } from '../models/ProfileModel'

interface ProfileInteractionButtonsProps {
    profile: ProfileModel
    isHandlingInteraction?: boolean
    likeProfile?: (profileId: string) => Promise<void>
    skipProfile?: (profileId: string) => Promise<void>
    unblockProfile?: (profileId: string) => Promise<void>
    unlikeProfile?: (profileId: string) => Promise<void>
    resetAndCallFunction: (func: () => Promise<void>) => void
}

const ProfileInteractionButtons = ({
    profile,
    isHandlingInteraction,
    likeProfile,
    skipProfile,
    unblockProfile,
    unlikeProfile,
    resetAndCallFunction,
}: ProfileInteractionButtonsProps) => {
    if (!likeProfile || !skipProfile || !unblockProfile || !unlikeProfile) {
        return null
    }

    if (profile.blocked) {
        return (
            <div className="oneInteractionButton">
                <Button className="unblockButton" disabled={isHandlingInteraction} onClick={() => resetAndCallFunction(() => unblockProfile(profile.id))} title="Unblock">
                    <BlockIcon fontSize="large" />
                </Button>
            </div>
        )
    }

    if (profile.liked && profile.matched) {
        return (
            <div className="oneInteractionButton">
                <Button className="unblockButton" disabled={isHandlingInteraction} onClick={() => resetAndCallFunction(() => unlikeProfile(profile.id))} title="Unlike">
                    <HeartBrokenIcon fontSize="large" />
                </Button>
            </div>
        )
    }

    if (profile.liked) {
        return (
            <div className="oneInteractionButton">
                <Button className="unblockButton" disabled={isHandlingInteraction} onClick={() => resetAndCallFunction(() => unlikeProfile(profile.id))} title="Unlike">
                    <ScheduleSendIcon fontSize="large" />
                </Button>
            </div>
        )
    }

    if (profile.skipped) {
        return (
            <div className="oneInteractionButton">
                <Button className="likeButton" disabled={isHandlingInteraction} onClick={() => resetAndCallFunction(() => likeProfile(profile.id))} title="Like">
                    <FavoriteIcon fontSize="large" />
                </Button>
            </div>
        )
    }

    return (
        <div className="skipLikeButtons">
            <Button className="skipButton" disabled={isHandlingInteraction} onClick={() => resetAndCallFunction(() => skipProfile(profile.id))} title="Skip">
                <ClearIcon fontSize="large" />
            </Button>
            <Button className="likeButton" disabled={isHandlingInteraction} onClick={() => resetAndCallFunction(() => likeProfile(profile.id))} title="Like">
                <FavoriteIcon fontSize="large" />
            </Button>
        </div>
    )
}

export default ProfileInteractionButtons
