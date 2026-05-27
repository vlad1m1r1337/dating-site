import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'

interface ProfileDemographicsProps {
    gender: string
    orientation: string
    age: number
    isSubmitting: boolean
    showRequiredErrors: boolean
    hasGenderError: boolean
    hasOrientationError: boolean
    handleSelectChange: (event: SelectChangeEvent) => void
    handleSelectNumberChange: (event: SelectChangeEvent) => void
}

const ProfileDemographics = ({
    gender,
    orientation,
    age,
    isSubmitting,
    showRequiredErrors,
    hasGenderError,
    hasOrientationError,
    handleSelectChange,
    handleSelectNumberChange,
}: ProfileDemographicsProps) => {
    return (
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Box sx={{ flex: 5 }}>
                <FormControl sx={{ width: '100%' }}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                        labelId="gender-label"
                        sx={{ width: '100%' }}
                        id="gender-select"
                        name="gender"
                        label="Gender"
                        disabled={isSubmitting}
                        value={gender}
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                    </Select>
                </FormControl>
                {showRequiredErrors && hasGenderError && (
                    <Typography color="error" variant="caption" display="block" mt={1}>
                        Please select your gender
                    </Typography>
                )}
            </Box>
            <Box sx={{ flex: 5 }}>
                <FormControl sx={{ width: '100%' }}>
                    <InputLabel id="orientation-label">Orientation</InputLabel>
                    <Select
                        labelId="orientation-label"
                        sx={{ width: '100%' }}
                        id="orientation-select"
                        name="orientation"
                        value={orientation}
                        disabled={isSubmitting}
                        label="Orientation"
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="heterosexual">Heterosexual</MenuItem>
                        <MenuItem value="homosexual">{gender === 'male' ? 'Homosexual' : 'Lesbian'}</MenuItem>
                        <MenuItem value="bisexual">Bisexual</MenuItem>
                    </Select>
                </FormControl>
                {showRequiredErrors && hasOrientationError && (
                    <Typography color="error" variant="caption" display="block" mt={1}>
                        Please select your orientation
                    </Typography>
                )}
            </Box>
            <Box sx={{ flex: 2 }}>
                <FormControl>
                    <InputLabel id="age-label">Age</InputLabel>
                    <Select
                        labelId="age-label"
                        id="age-select"
                        value={age.toString()}
                        label="Age"
                        name="age"
                        onChange={handleSelectNumberChange}
                    >
                        {Array.from(Array(82).keys()).map((value) => (
                            <MenuItem key={value + 18} value={(value + 18).toString()}>{value + 18}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    )
}

export default ProfileDemographics
