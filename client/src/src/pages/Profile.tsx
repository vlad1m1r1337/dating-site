import { useEffect } from 'react'
import { Box, Button, Card, CircularProgress, Divider, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import 'leaflet/dist/leaflet.css'
import ProfileImages from './profile/profile-images'
import ProfileDemographics from './profile/profile-demographics'
import ProfileTags from './profile/profile-tags'
import ProfileBio from './profile/profile-bio'
import ProfileLocation from './profile/profile-location'
import ProfileInfoFields from './profile/profile-info-fields'
import { useProfileForm } from './profile/use-profile-form'

interface ProfilePageProps {
    setErrorAlert: (message: string) => void
    setSuccessAlert: (message: string) => void
}

const pageSx = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    p: 2,
}

const ProfilePage = ({ setErrorAlert, setSuccessAlert }: ProfilePageProps) => {
    const profileForm = useProfileForm(setErrorAlert, setSuccessAlert)
    const {
        form,
        isPageLoading,
        imagesAreLoading,
        isSubmitting,
        isMapOpened,
        shouldShowRequiredErrors,
        currentPosition,
        mapRef,
        imageInputRef,
        navigate,
        hasEmailError,
        hasFirstNameError,
        hasLastNameError,
        hasTagsError,
        hasImagesError,
        hasGeolocError,
        hasGenderError,
        hasOrientationError,
        getUser,
        handleFieldChange,
        handleSelectChange,
        handleSelectNumberChange,
        handleDeleteImg,
        handleDragImg,
        handleTagChange,
        handlePositionChange,
        handleSubmit,
        onChangeImg,
        getLocation,
        setImagesAreLoading,
        setIsMapOpened,
    } = profileForm

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getUser()
            return
        }

        navigate('/login')
    }, [getUser, navigate])

    if (isPageLoading) {
        return (
            <Box className="profilePage" sx={pageSx}>
                <CircularProgress color="secondary" className="mt-4" />
            </Box>
        )
    }

    return (
        <Box className="profilePage" sx={pageSx}>
            <Card sx={{ width: '100%', maxWidth: 560, p: 2 }} elevation={6} style={{ boxShadow: '8px 8px 10px #000000' }}>
                <Typography variant="h6" fontWeight="bold" textAlign="center" mb={1}>PROFILE</Typography>
                <ProfileImages
                    images={form.images}
                    imagesAreLoading={imagesAreLoading}
                    isSubmitting={isSubmitting}
                    imageInputRef={imageInputRef}
                    showRequiredErrors={shouldShowRequiredErrors}
                    hasImagesError={hasImagesError}
                    handleDeleteImg={handleDeleteImg}
                    handleDragImg={handleDragImg}
                    handleImageLoad={(index) => setImagesAreLoading(prev => prev.filter((value) => value !== index))}
                    onChangeImg={onChangeImg}
                />
                <Divider sx={{ my: 2 }} />
                <ProfileDemographics
                    gender={form.gender}
                    orientation={form.orientation}
                    age={form.age}
                    isSubmitting={isSubmitting}
                    showRequiredErrors={shouldShowRequiredErrors}
                    hasGenderError={hasGenderError}
                    hasOrientationError={hasOrientationError}
                    handleSelectChange={handleSelectChange}
                    handleSelectNumberChange={handleSelectNumberChange}
                />
                <ProfileTags
                    tags={form.tags}
                    isSubmitting={isSubmitting}
                    hasTagsError={shouldShowRequiredErrors && hasTagsError}
                    handleTagChange={handleTagChange}
                />
                <Divider sx={{ my: 2 }} />
                <ProfileBio bio={form.bio} isSubmitting={isSubmitting} handleFieldChange={handleFieldChange} />
                <ProfileLocation
                    isMapOpened={isMapOpened}
                    currentPosition={currentPosition}
                    mapRef={mapRef}
                    showRequiredErrors={shouldShowRequiredErrors}
                    hasGeolocError={hasGeolocError}
                    toggleMap={() => setIsMapOpened(prev => !prev)}
                    getLocation={getLocation}
                    handlePositionChange={handlePositionChange}
                />
                <ProfileInfoFields
                    firstName={form.firstName}
                    lastName={form.lastName}
                    email={form.email}
                    isSubmitting={isSubmitting}
                    hasFirstNameError={hasFirstNameError}
                    hasLastNameError={hasLastNameError}
                    hasEmailError={hasEmailError}
                    handleFieldChange={handleFieldChange}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button variant="outlined" color="primary" size="medium" style={{ width: 'fit-content' }} onClick={() => navigate('/')}>
                        Close
                    </Button>
                    <LoadingButton
                        variant="contained"
                        color="primary"
                        disabled={hasEmailError || hasFirstNameError || hasTagsError || hasLastNameError}
                        loading={isSubmitting}
                        size="medium"
                        style={{ width: 'fit-content' }}
                        onClick={handleSubmit}
                    >
                        Save
                    </LoadingButton>
                </Box>
            </Card>
        </Box>
    )
}

export default ProfilePage
