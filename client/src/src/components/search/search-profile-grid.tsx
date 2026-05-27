import { Grid, Typography } from '@mui/material'
import goose from '../../../assets/goose.jpg'
import { ProfilesModel } from '../models/ProfilesModel'

interface SearchProfileGridProps {
    profiles: ProfilesModel[]
    setProfileId: (profileId: string) => void
}

const getProfileImageSrc = (image?: string) => {
    if (!image) {
        return goose
    }

    return `${import.meta.env.VITE_URL_API}/image/${image}`
}

const SearchProfileGrid = ({ profiles, setProfileId }: SearchProfileGridProps) => {
    if (!profiles.length) {
        return null
    }

    const hasSingleProfile = profiles.length === 1
    const profileGridSize = hasSingleProfile ? { xs: 12, sm: 8, md: 6 } : { xs: 6, sm: 4, md: 3 }

    return (
        <div className="profileList">
            <Grid container spacing={2} className="flex-wrap p-0" justifyContent={hasSingleProfile ? 'center' : 'flex-start'}>
                {profiles.map((user) => (
                    <Grid item {...profileGridSize} className="mt-3" key={user.id}>
                        <button type="button" className="imgMosaicContainer" onClick={() => setProfileId(user.id)}>
                            <img
                                src={getProfileImageSrc(user.image)}
                                alt={`${user.firstName} profile`}
                                className="imgMosaic"
                                onError={(event) => { event.currentTarget.src = goose }}
                                loading="lazy"
                            />
                            <div className="imgMosaicOverlay">
                                <Typography noWrap variant="h6" className="imgMosaicOverlayText text-white">{user.firstName}</Typography>
                                <Typography variant="subtitle1" className="imgMosaicOverlayText text-white">{user.age}</Typography>
                            </div>
                        </button>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default SearchProfileGrid
