import { ChangeEvent, useCallback, useRef, useState } from 'react'
import { SelectChangeEvent } from '@mui/material'
import { LatLngExpression } from 'leaflet'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'
import validator from 'validator'
import L from 'leaflet'
import instance from '../../api/Instance'
import { UpdateForm } from '../models/UpdateForm'
import { UserModel } from '../models/UserModel'
import { humanizeApiError } from '../../utils/apiErrorUtils'
import { BrowserPosition } from './types'

const defaultForm: UpdateForm = {
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    orientation: '',
    bio: '',
    age: 18,
    tags: {},
    images: [],
    geoloc: '',
    elo: 0,
}

export const useProfileForm = (
    setErrorAlert: (message: string) => void,
    setSuccessAlert: (message: string) => void,
) => {
    const [form, setForm] = useState<UpdateForm>(defaultForm)
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [imagesAreLoading, setImagesAreLoading] = useState<number[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMapOpened, setIsMapOpened] = useState(false)
    const [shouldShowRequiredErrors, setShouldShowRequiredErrors] = useState(false)
    const [currentPosition, setCurrentPosition] = useState<LatLngExpression>({ lat: 0, lng: 0 })
    const mapRef = useRef<L.Map>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const hasEmailError = !form.email.length || !validator.isEmail(form.email)
    const hasFirstNameError = !form.firstName.length || !(/^[a-zA-Z\u00C0-\u00FF]{3,16}$/).test(form.firstName)
    const hasLastNameError = !form.lastName.length || !(/^[a-zA-Z\u00C0-\u00FF]{3,16}$/).test(form.lastName)
    const hasTagsError = !Object.entries(form.tags).filter(([, value]) => value).length
    const hasImagesError = !form.images.length
    const hasGeolocError = !form.geoloc.length || form.geoloc.split(',').length !== 2 || form.geoloc === '0,0'
    const hasGenderError = !form.gender.length
    const hasOrientationError = !form.orientation.length

    const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [event.target.id]: event.target.value }))
    }

    const handleSelectChange = (event: SelectChangeEvent) => {
        setForm(prev => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const handleSelectNumberChange = (event: SelectChangeEvent) => {
        setForm(prev => ({ ...prev, [event.target.name]: parseInt(event.target.value) }))
    }

    const handleDeleteImg = (index: number) => {
        const images = _.cloneDeep(form.images)
        images.splice(index, 1)
        setForm(prev => ({ ...prev, images }))
    }

    const handleDragImg = (dragIndex: number, dropIndex: number) => {
        const isInvalidDrag = Number.isNaN(dragIndex)
            || dragIndex < 0
            || dragIndex >= form.images.length
            || dragIndex === dropIndex
            || isSubmitting
            || imagesAreLoading.includes(dragIndex)
            || imagesAreLoading.includes(dropIndex)

        if (isInvalidDrag) {
            return
        }

        const images = _.cloneDeep(form.images)
        const [draggedImage] = images.splice(dragIndex, 1)
        images.splice(dropIndex, 0, draggedImage)
        setForm(prev => ({ ...prev, images }))
    }

    const handleTagChange = (key: string, value: boolean) => {
        const tags = _.cloneDeep(form.tags)
        if (Object.keys(tags).includes(key)) {
            tags[key] = value
            setForm(prev => ({ ...prev, tags }))
        }
    }

    const handlePositionChange = (position: BrowserPosition) => {
        setCurrentPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
        setForm(prev => ({ ...prev, geoloc: `${position.coords.latitude},${position.coords.longitude}` }))
    }

    const getUser = useCallback(async () => {
        await instance.get<UserModel>('/user').then((res) => {
            const imageLoadingIndexes = res.data.images.map((_image, index) => index)
            const filteredData = _.omit(res.data, ['id', 'username', 'completion', 'last_login']) as UpdateForm
            filteredData.images = filteredData.images.map((img) => `${import.meta.env.VITE_URL_API}/image/${img}`)
            setImagesAreLoading(imageLoadingIndexes)
            setForm(filteredData)

            const parsedGeoloc = filteredData.geoloc.split(',')
            if (parsedGeoloc.length === 2) {
                const position = { lat: parseFloat(parsedGeoloc[0]), lng: parseFloat(parsedGeoloc[1]) }
                setCurrentPosition(position)
                mapRef.current?.setView(position, 13)
            }
            setIsPageLoading(false)
        }).catch((error) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                localStorage.removeItem('token')
                navigate('/login')
                return
            }

            setErrorAlert(humanizeApiError(error?.response?.data?.message || 'Could not load profile'))
            setIsPageLoading(false)
        })
    }, [navigate, setErrorAlert])

    const handleImgUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('image', file)
        await instance.post('/image/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then((res) => {
            setForm(prev => ({ ...prev, images: [...prev.images, `${import.meta.env.VITE_URL_API}/image/${res.data.url}`] }))
        }).catch(() => {
            setErrorAlert('Could not upload image')
        })
    }

    const handleSubmit = async () => {
        setShouldShowRequiredErrors(true)
        if (hasImagesError || hasGeolocError || hasGenderError || hasOrientationError) {
            const missingActions = [
                hasImagesError ? 'add at least one photo' : null,
                hasGeolocError ? 'set your location' : null,
                hasGenderError ? 'select your gender' : null,
                hasOrientationError ? 'select your orientation' : null,
            ].filter(Boolean)
            const last = missingActions.pop()
            const prefix = missingActions.length ? `${missingActions.join(', ')} and ` : ''
            setErrorAlert(`Please ${prefix}${last}`)
            return
        }

        setIsSubmitting(true)
        const formToSend = _.omit(_.cloneDeep(form), ['elo'])
        if (!formToSend.bio) {
            formToSend.bio = ' '
        }
        formToSend.images = formToSend.images.map((img) => img.split('/image/')[1])
        await instance.put('/user', formToSend).then(() => {
            setSuccessAlert('Profile updated')
            getUser()
        }).catch((err) => {
            setErrorAlert(humanizeApiError(err.response?.data?.message || 'Could not update profile'))
        }).finally(() => {
            setIsSubmitting(false)
        })
    }

    const onChangeImg = async (files: FileList | null) => {
        if (!files) {
            return
        }

        for (let index = 0; index < files.length && index + form.images.length < 5; index++) {
            await handleImgUpload(files[index])
        }
    }

    const getLocation = () => {
        const success = (position: BrowserPosition) => {
            handlePositionChange(position)
            mapRef.current?.setView({ lat: position.coords.latitude, lng: position.coords.longitude }, 13)
        }

        const error = () => {
            instance.get('/geoloc').then((res) => {
                if (res.data.lat === 0 && res.data.lng === 0) {
                    setErrorAlert('Failed to retrieve your location, please check your browser settings')
                    return
                }
                handlePositionChange({ coords: { latitude: res.data.lat, longitude: res.data.lng } })
                mapRef.current?.setView(res.data, 13)
            }).catch(() => {
                setErrorAlert('Failed to retrieve your location, please check your browser settings')
            })
        }

        if (!navigator.geolocation) {
            setErrorAlert('Geolocation is not supported by your browser')
            error()
            return
        }

        navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 10000 })
    }

    return {
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
    }
}
