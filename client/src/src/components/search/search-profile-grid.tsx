import { CircularProgress, Grid, Typography } from '@mui/material'
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

    return (
        <div className="profileList">
            <Grid container spacing={2} className="flex-wrap p-0">
                {profiles.map((user) => (
                    <Grid item xs={6} sm={4} className="mt-3 imgMosaicContainer position-relative" key={user.id} height="177px">
                        {user.image ? (
                            <>
                                <img
                                    src={getProfileImageSrc(user.image)}
                                    alt="user"
                                    className="imgMosaic"
                                    style={{ position: 'absolute', top: 0, borderRadius: '6px 6px 0 0' }}
                                    onClick={() => setProfileId(user.id)}
                                    onError={(event) => { event.currentTarget.src = goose }}
                                    loading="lazy"
                                />
                                <div className="imgMosaicOverlay">
                                    <Typography noWrap variant="h6" className="text-white">{user.firstName}</Typography>
                                    <Typography variant="subtitle1" className="text-white">{user.age}</Typography>
                                </div>
                            </>
                        ) : (
                            <CircularProgress color="secondary" />
                        )}
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default SearchProfileGrid
