import { Chip, Stack } from '@mui/material'
import FemaleIcon from '@mui/icons-material/Female'
import MaleIcon from '@mui/icons-material/Male'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import StarIcon from '@mui/icons-material/Star'
import { ProfileModel } from '../models/ProfileModel'

interface ProfileDetailsProps {
    profile: ProfileModel
}

const renderEloIcon = (elo: number) => {
    if (elo < 20) {
        return <StarBorderIcon style={{ color: '#FFD700' }} />
    }

    if (elo < 100) {
        return <StarHalfIcon style={{ color: '#FFD700' }} />
    }

    if (elo < 500) {
        return <StarIcon style={{ color: '#FFD700' }} />
    }

    return <MilitaryTechIcon style={{ color: '#FFD700' }} />
}

const ProfileDetails = ({ profile }: ProfileDetailsProps) => {
    return (
        <div style={{ padding: '8px 14px 0px 14px' }}>
            <div className="d-flex justify-content-between flex-wrap">
                <div className="d-flex align-items-end flex-wrap">
                    <h2 className="fw-bold mb-0" style={{ wordWrap: 'break-word', maxWidth: '230px' }} >{profile.firstName}</h2>
                    <h4 className="ms-2 mb-0" style={{ paddingBottom: '2px' }}>{profile.age}</h4>
                    {profile.gender === 'female' ? (
                        <FemaleIcon style={{ color: '#c90076' }} fontSize="large" className="py-1" />
                    ) : (
                        <MaleIcon style={{ color: '#2986CC' }} fontSize="large" className="py-1" />
                    )}
                </div>
                <div className="d-flex align-items-end mb-1">
                    {renderEloIcon(profile.elo)}
                    <h5 className="ms-1 mb-0 fw-bold">{profile.elo}</h5>
                </div>
            </div>
            <p className="font-size-12 mb-0 d-flex">  {profile.distance == 1 ? 'Less than a' : Math.round(profile.distance + Number.EPSILON) || '?'} kilometer from you</p>
            <hr className="w-100 mt-2" />
            <p className="text-start text-break">{profile.bio}</p>
            <hr className="w-100 mt-2" />
            <div className="col-12 overflow-y-scroll tagsContainer d-flex">
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: '100%' }}>
                    {profile.tags && Object.entries(profile.tags).map(([key, value]) => {
                        if (!value) {
                            return null
                        }

                        if (profile.commonTags && profile.commonTags.includes(key)) {
                            return <Chip key={key} label={key} variant="filled" color="primary" className="fw-bold m-0 me-1 mb-1" />
                        }

                        return <Chip key={key} label={key} variant="outlined" color="primary" className="fw-bold m-0 me-1 mb-1" />
                    })}
                </Stack>
            </div>
        </div>
    )
}

export default ProfileDetails
