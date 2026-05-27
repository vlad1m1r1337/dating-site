import { Box, Divider, TextField, Typography } from '@mui/material'

interface ProfileInfoFieldsProps {
    firstName: string
    lastName: string
    email: string
    isSubmitting: boolean
    hasFirstNameError: boolean
    hasLastNameError: boolean
    hasEmailError: boolean
    handleFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ProfileInfoFields = ({
    firstName,
    lastName,
    email,
    isSubmitting,
    hasFirstNameError,
    hasLastNameError,
    hasEmailError,
    handleFieldChange,
}: ProfileInfoFieldsProps) => {
    return (
        <>
            <Divider sx={{ my: 2 }}><Typography fontWeight="bold">INFORMATIONS</Typography></Divider>
            <Box sx={{ mt: 2 }}>
                <TextField
                    error={hasFirstNameError}
                    value={firstName}
                    disabled={isSubmitting}
                    onChange={handleFieldChange}
                    sx={{ width: '100%' }}
                    required
                    id="firstName"
                    label="First name"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    helperText={hasFirstNameError ? 'firstname must be between 3 and 16 characters long and contain only letters' : ''}
                    variant="outlined"
                    color="primary"
                    inputProps={{ maxLength: 16 }}
                />
            </Box>
            <Box sx={{ mt: 2 }}>
                <TextField
                    error={hasLastNameError}
                    value={lastName}
                    disabled={isSubmitting}
                    onChange={handleFieldChange}
                    sx={{ width: '100%' }}
                    required
                    id="lastName"
                    label="Last name"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    helperText={hasLastNameError ? 'last name must be between 3 and 16 characters long and contain only letters' : ''}
                    variant="outlined"
                    color="primary"
                    inputProps={{ maxLength: 16 }}
                />
            </Box>
            <Box sx={{ mt: 2 }}>
                <TextField
                    error={hasEmailError}
                    value={email}
                    disabled={isSubmitting}
                    onChange={handleFieldChange}
                    sx={{ width: '100%' }}
                    required
                    id="email"
                    label="Email"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    helperText={hasEmailError ? 'Invalid email' : ''}
                    variant="outlined"
                    color="primary"
                    inputProps={{ maxLength: 320 }}
                />
            </Box>
        </>
    )
}

export default ProfileInfoFields
