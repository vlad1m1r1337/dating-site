import { Box, Chip, Divider, Typography } from '@mui/material'

interface ProfileTagsProps {
    tags: Record<string, boolean>
    isSubmitting: boolean
    hasTagsError: boolean
    handleTagChange: (key: string, value: boolean) => void
}

const ProfileTags = ({ tags, isSubmitting, hasTagsError, handleTagChange }: ProfileTagsProps) => {
    return (
        <>
            <Divider sx={{ my: 2 }}><Typography fontWeight="bold">TAGS</Typography></Divider>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {Object.entries(tags).map(([key, value]) => {
                    if (value) {
                        return (
                            <Chip
                                key={key}
                                label={key}
                                variant="filled"
                                color="primary"
                                onClick={() => { }}
                                onDelete={() => handleTagChange(key, false)}
                                disabled={isSubmitting}
                            />
                        )
                    }

                    return (
                        <Chip
                            key={key}
                            label={key}
                            variant="outlined"
                            color="primary"
                            onClick={() => { handleTagChange(key, true) }}
                            disabled={isSubmitting}
                        />
                    )
                })}
            </Box>
            {hasTagsError && (
                <Typography color="error" variant="caption" display="block" mt={1}>
                    Please select at least one tag
                </Typography>
            )}
        </>
    )
}

export default ProfileTags
