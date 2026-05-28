import { RefObject } from 'react'
import { CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import addImage from '../../../assets/add-image2.png'
import goose from '../../../assets/goose.jpg'

interface ProfileImagesProps {
    images: string[]
    imagesAreLoading: number[]
    isSubmitting: boolean
    imageInputRef: RefObject<HTMLInputElement>
    showRequiredErrors: boolean
    hasImagesError: boolean
    handleDeleteImg: (index: number) => void
    handleDragImg: (dragIndex: number, dropIndex: number) => void
    handleImageLoad: (index: number) => void
    onChangeImg: (files: FileList | null) => Promise<void>
}

const ProfileImages = ({
    images,
    imagesAreLoading,
    isSubmitting,
    imageInputRef,
    showRequiredErrors,
    hasImagesError,
    handleDeleteImg,
    handleDragImg,
    handleImageLoad,
    onChangeImg,
}: ProfileImagesProps) => {
    return (
        <>
            <Grid container spacing={2}>
                {images.map((image, index) => (
                    <Grid
                        item
                        xs={6}
                        sm={4}
                        className="mt-3 imgMosaicContainer draggableImgMosaicContainer"
                        key={image}
                        draggable={!isSubmitting && !imagesAreLoading.includes(index)}
                        onDragStart={(event) => event.dataTransfer.setData('text/plain', index.toString())}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                            event.preventDefault()
                            handleDragImg(Number(event.dataTransfer.getData('text/plain')), index)
                        }}
                    >
                        {imagesAreLoading.includes(index) && <CircularProgress color="secondary" />}
                        <img
                            src={image}
                            alt="profile"
                            className="imgMosaic imgMosaicProfile"
                            onError={(event) => { event.currentTarget.src = goose }}
                            onLoad={() => handleImageLoad(index)}
                            loading="lazy"
                        />
                        {!isSubmitting && !imagesAreLoading.includes(index) && (
                            <IconButton
                                aria-label="Delete photo"
                                className="imgDeleteButton"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    handleDeleteImg(index)
                                }}
                                size="small"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Grid>
                ))}
                {images.length < 5 && (
                    <Grid item xs={6} sm={4} className="mt-3 imgMosaicContainer">
                        <img src={addImage} alt="Click to upload" className="imgMosaic" onClick={() => imageInputRef.current?.click()} />
                        <input
                            ref={imageInputRef}
                            multiple
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            onChange={(event) => onChangeImg(event.target.files)}
                            style={{ display: 'none' }}
                            disabled={isSubmitting}
                        />
                    </Grid>
                )}
            </Grid>
            {showRequiredErrors && hasImagesError && (
                <Typography color="error" variant="caption" display="block" mt={1}>
                    Please add at least one photo
                </Typography>
            )}
        </>
    )
}

export default ProfileImages
