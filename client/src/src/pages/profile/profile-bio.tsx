import { Box, TextField, Typography } from '@mui/material'

interface ProfileBioProps {
    bio: string
    isSubmitting: boolean
    handleFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ProfileBio = ({ bio, isSubmitting, handleFieldChange }: ProfileBioProps) => {
    return (
        <Box sx={{ position: 'relative', mt: 1 }}>
            <TextField
                type="text"
                label="Bio"
                id="bio"
                variant="outlined"
                sx={{ width: '100%' }}
                multiline
                value={bio}
                disabled={isSubmitting}
                inputProps={{ maxLength: 200 }}
                InputLabelProps={{ shrink: true, className: 'mx-2' }}
                onChange={handleFieldChange}
            />
            <Typography sx={{ position: 'absolute', bottom: 8, right: 8, fontSize: '0.75rem' }}>
                {bio.length}/{200}
            </Typography>
        </Box>
    )
}

export default ProfileBio
