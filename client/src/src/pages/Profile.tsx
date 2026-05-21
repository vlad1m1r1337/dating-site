import { Badge, Box, Button, Card, Chip, CircularProgress, Divider, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material"
import { UpdateForm } from "./models/UpdateForm"
import { useCallback, useEffect, useRef, useState } from "react"
import _ from "lodash"
import validator from "validator"
import addImage from "../../assets/add-image2.png"
import goose from "../../assets/goose.jpg"
import marker from "../../assets/marker.png"
import instance from "../api/Instance"
import { useNavigate } from "react-router-dom"
import { LoadingButton } from "@mui/lab"
import { UserModel } from "./models/UserModel"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L, { LatLngExpression } from "leaflet"
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import 'leaflet/dist/leaflet.css';

interface ProfilePageProps {
    setErrorAlert: (message: string) => void
    setSuccessAlert: (message: string) => void
}

const ProfilePage = ({ setErrorAlert, setSuccessAlert }: ProfilePageProps) => {
    const [form, setForm] = useState<UpdateForm>({
        firstName: '', lastName: '', email: '', gender: '', orientation: '', bio: '', age: 18, tags: {}, images: [], geoloc: '', elo: 0
    })
    const emailError = !form.email.length || (validator.isEmail(form.email) ? false : true)
    const firstnameError = !form.firstName.length || !(/^[a-zA-Z\u00C0-\u00FF]{3,16}$/).test(form.firstName)
    const lastnameError = !form.lastName.length || !(/^[a-zA-Z\u00C0-\u00FF]{3,16}$/).test(form.lastName)
    const tagsError = !Object.entries(form.tags).filter(([, value]) => value).length
    const imagesError = !form.images.length
    const geolocError = !form.geoloc.length || form.geoloc.split(',').length !== 2 || form.geoloc === "0,0"

    const [isPageLoading, setIsPageLoading] = useState(true)
    const [imgAreLoading, setImgAreLoading] = useState<number[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMapOpened, setIsMapOpened] = useState(false)
    const [showRequiredErrors, setShowRequiredErrors] = useState(false)

    const [currentPosition, setCurrentPosition] = useState<LatLngExpression>({ lat: 0, lng: 0 })

    const mapRef = useRef<L.Map>(null);

    const navigate = useNavigate();

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        if (Number.isNaN(dragIndex) || dragIndex < 0 || dragIndex >= form.images.length || dragIndex === dropIndex || isSubmitting || imgAreLoading.includes(dragIndex) || imgAreLoading.includes(dropIndex)) {
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

    interface Position {
        coords: {
            latitude: number
            longitude: number
        }
    }

    const handlePositionChange = (position: Position) => {
        setCurrentPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
        setForm(prev => ({ ...prev, geoloc: `${position.coords.latitude},${position.coords.longitude}` }))
    }

    const getUser = useCallback(async () => {
        await instance.get<UserModel>('/user').then((res) => {
            const imgLoadingArray = []
            for (let i = 0; i < res.data.images.length; i++) {
                imgLoadingArray.push(i)
            }
            const filteredData = _.omit(res.data, [
                "id",
                "username",
                "completion",
                "last_login",
            ]) as UpdateForm
            filteredData.images = filteredData.images.map((img) => import.meta.env.VITE_URL_API + "/image/" + img)
            setForm(filteredData)
            const parsedGeoloc = filteredData.geoloc.split(',')
            if (parsedGeoloc.length === 2) {
                setCurrentPosition({ lat: parseFloat(parsedGeoloc[0]), lng: parseFloat(parsedGeoloc[1]) })
                mapRef.current?.setView({ lat: parseFloat(parsedGeoloc[0]), lng: parseFloat(parsedGeoloc[1]) }, 13)
            }
            setIsPageLoading(false)
        }).catch(() => {
            localStorage.removeItem("token")
            navigate('/login')
        })
    }, [navigate])

    const handleImgUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('image', file)
        await instance.post('/image/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }).then((res) => {
            setForm(prev => ({ ...prev, images: [...prev.images].concat(import.meta.env.VITE_URL_API + "/image/" + res.data.url) }))
        }).catch(() => {
            setErrorAlert("Could not upload image")
        })
    }

    const handleSubmit = async () => {
        setShowRequiredErrors(true)
        if (imagesError || geolocError) {
            const missingFields = [
                imagesError ? "at least one photo" : null,
                geolocError ? "your location" : null,
            ].filter(Boolean).join(" and ")
            setErrorAlert(`Please add ${missingFields}`)
            return
        }
        setIsSubmitting(true)
        const formToSend = _.omit(_.cloneDeep(form), ["elo"])
        if (!formToSend.bio) {
            formToSend.bio = " "
        }
        formToSend.images = formToSend.images.map((img) => img.split("/image/")[1])
        await instance.put('/user', formToSend).then(() => {
            setSuccessAlert("Profile updated")
            getUser()
        }).catch((err) => {
            setErrorAlert(err.response.data.message)
        }).finally(() => {
            setIsSubmitting(false)
        })
    }

    const onChangeImg = async (files: FileList | null) => {

        if (!files) {
            return;
        }

        for (let i = 0; i < files.length && i + form.images.length < 5; i++) {
            await handleImgUpload(files[i])
        }
    }

    const getLocation = () => {
        const success = (position: Position) => {
            handlePositionChange(position)
            mapRef.current?.setView({ lat: position.coords.latitude, lng: position.coords.longitude }, 13)
        };

        const error = () => {

            instance.get('/geoloc').then((res) => {
                if (res.data.lat === 0 && res.data.lng === 0) {
                    setErrorAlert("Failed to retrieve your location, please check your browser settings")
                    return
                }
                handlePositionChange({ coords: { latitude: res.data.lat, longitude: res.data.lng } })
                mapRef.current?.setView(res.data, 13)
            }).catch(() => {
                setErrorAlert("Failed to retrieve your location, please check your browser settings")
            })
        };

        if (!navigator.geolocation) {
            setErrorAlert("Geolocation is not supported by your browser")
            error()
            return;
        }

        navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 10000 });
    };

    const DraggableMarker = () => {
        return (
            <Marker
                draggable
                icon={L.icon({
                    iconUrl: marker,
                    iconSize: [60, 60],
                })}
                position={currentPosition}
                eventHandlers={
                    {
                        dragend: (e) => {
                            const latLng = e.target.getLatLng()
                            handlePositionChange({ coords: { latitude: latLng.lat, longitude: latLng.lng } })
                            mapRef.current?.setView(e.target.getLatLng(), 13)
                        }
                    }
                }
            />
        );
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            getUser()
        }
        else {
            navigate('/login')
        }
    }, [getUser, navigate])


    return (
        <Box className="profilePage" sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", height: "100%", minHeight: 0, overflowY: "auto", p: 2 }}>
            {isPageLoading ? <CircularProgress color="secondary" className="mt-4" /> :
                <Card sx={{ width: "100%", maxWidth: 560, p: 2 }} elevation={6} style={{ boxShadow: "8px 8px 10px #000000" }}>
                        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={1}>PROFILE</Typography>
                        <Grid container spacing={2}>
                                {form.images.map((image, index) => {
                                    return (
                                        <Grid
                                            item
                                            xs={6}
                                            sm={4}
                                            className="mt-3 imgMosaicContainer draggableImgMosaicContainer"
                                            key={image}
                                            draggable={!isSubmitting && !imgAreLoading.includes(index)}
                                            onDragStart={(event) => event.dataTransfer.setData("text/plain", index.toString())}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={(event) => {
                                                event.preventDefault()
                                                handleDragImg(Number(event.dataTransfer.getData("text/plain")), index)
                                            }}
                                        >
                                            {imgAreLoading.includes(index) && <CircularProgress color="secondary" />}
                                            <Badge
                                                color="error"
                                                badgeContent={<p className="badgeCross" role="button" style={{ cursor: "pointer" }} onClick={(event) => { event.stopPropagation(); handleDeleteImg(index) }}>x</p>}
                                                style={{ display: isSubmitting || imgAreLoading.includes(index) ? "none" : "block" }}
                                            >
                                                <img src={image} alt="profile" className="imgMosaic" onError={(e) => { e.currentTarget.src = goose }} onLoad={() => { setImgAreLoading(prev => prev.filter((value) => value !== index)) }} loading="lazy" />
                                            </Badge>
                                        </Grid>
                                    )
                                })}
                                {form.images.length < 5 &&
                                    <Grid item xs={6} sm={4} className="mt-3 imgMosaicContainer">
                                        <img src={addImage} alt="Click to upload" className="imgMosaic" onClick={() => document.getElementById("imgInput")?.click()} />
                                        <input multiple id="imgInput" type="file" accept=".jpg, .jpeg, .png" onChange={(event) => onChangeImg(event.target.files)} style={{ display: "none" }} disabled={isSubmitting} />
                                    </Grid>}
                        </Grid>
                        {showRequiredErrors && imagesError &&
                            <Typography color="error" variant="caption" display="block" mt={1}>
                                Please add at least one photo
                            </Typography>}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                                <Box sx={{ flex: 5 }}>
                                    <FormControl sx={{ width: "100%" }}>
                                        <InputLabel id="gender-label">Gender</InputLabel>
                                        <Select
                                            labelId="gender-label"
                                            sx={{ width: "100%" }}
                                            id="gender-select"
                                            name="gender"
                                            label="Gender"
                                            disabled={isSubmitting}
                                            value={form.gender}
                                            onChange={handleSelectChange}
                                        >
                                            <MenuItem value={"male"}>Male</MenuItem>
                                            <MenuItem value={"female"}>Female</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flex: 5 }}>
                                    <FormControl sx={{ width: "100%" }}>
                                        <InputLabel id="orientation-label">Orientation</InputLabel>
                                        <Select
                                            labelId="orientation-label"
                                            sx={{ width: "100%" }}
                                            id="orientation-select"
                                            name="orientation"
                                            value={form.orientation}
                                            disabled={isSubmitting}
                                            label="Orientation"
                                            onChange={handleSelectChange}
                                        >
                                            <MenuItem value={"heterosexual"}>Heterosexual</MenuItem>
                                            <MenuItem value={"homosexual"}>{form.gender === "male" ? "Homosexual" : "Lesbian"}</MenuItem>
                                            <MenuItem value={"bisexual"}>Bisexual</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flex: 2 }}>
                                    <FormControl>
                                        <InputLabel id="age-label">Age</InputLabel>
                                        <Select
                                            labelId="age-label"
                                            id="age-select"
                                            value={form.age.toString()}
                                            label="Age"
                                            name="age"
                                            onChange={handleSelectNumberChange}
                                        >
                                            {Array.from(Array(82).keys()).map((value, index) => {
                                                return (
                                                    <MenuItem key={index} value={(value + 18).toString()}>{value + 18}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </Box>
                        </Box>
                        <Divider sx={{ my: 2 }}><Typography fontWeight="bold">TAGS</Typography></Divider>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                                    {Object.entries(form.tags).map(([key, value], index) => {
                                        return value ?
                                            <Chip key={index} label={key} variant="filled" color="primary"  onClick={() => { }} onDelete={() => handleTagChange(key, false)} disabled={isSubmitting} />
                                            :
                                            <Chip key={index} label={key} variant="outlined" color="primary"  onClick={() => { handleTagChange(key, true) }} disabled={isSubmitting} />
                                    })}
                                </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ position: "relative", mt: 1 }}>
                                    <TextField
                                        type="text"
                                        label="Bio"
                                        id="bio"
                                        variant="outlined"
                                        sx={{ width: "100%" }}
                                        multiline
                                        value={form.bio}
                                        disabled={isSubmitting}
                                        inputProps={{ maxLength: 200 }}
                                        InputLabelProps={{ shrink: true, className: 'mx-2' }}
                                        onChange={handleFieldChange}
                                    />
                                    <Typography
                                        sx={{ position: "absolute", bottom: 8, right: 8, fontSize: "0.75rem" }}
                                    >
                                        {form.bio.length}/{200}
                                    </Typography>
                                </Box>
                            <Box sx={{ mt: 2 }}>
                                {isMapOpened ?
                                    <div className="mapContainer position-relative">
                                        <MapContainer center={currentPosition} zoom={13} style={{ height: '400px', width: '100%' }} ref={mapRef}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <DraggableMarker />
                                        </MapContainer>
                                        <div className="position-absolute bottom-0 end-0" style={{ zIndex: 1000, marginBottom: "64px", marginRight: "10px" }} >
                                            <LocationSearchingIcon onClick={() => mapRef.current?.setView(currentPosition, 13)} style={{ backgroundColor: "white", borderRadius: "50%", padding: "5px", width: "35px", height: "35px", cursor: "pointer" }} />
                                        </div>
                                        <div className="position-absolute bottom-0 end-0" style={{ zIndex: 1000, marginBottom: "22px", marginRight: "10px" }}>
                                            <LocationOnIcon onClick={() => getLocation()} style={{ backgroundColor: "white", borderRadius: "50%", padding: "5px", width: "35px", height: "35px", cursor: "pointer" }} />
                                        </div>
                                    </div> : null}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    className="mt-2 w-100"
                                    onClick={() => setIsMapOpened(prev => !prev)}
                                >
                                    {isMapOpened ? "Close map" : "Open map"}
                                </Button>
                                {showRequiredErrors && geolocError &&
                                    <Typography color="error" variant="caption" display="block" mt={1}>
                                        Please set your location
                                    </Typography>}
                            </Box>
                        <Divider sx={{ my: 2 }}><Typography fontWeight="bold">INFORMATIONS</Typography></Divider>
                        <Box sx={{ mt: 2 }}>
                                <TextField
                                    error={firstnameError}
                                    value={form.firstName}
                                    disabled={isSubmitting}
                                    onChange={handleFieldChange}
                                    sx={{ width: "100%" }}
                                    required
                                    id="firstName"
                                    label="First name"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    helperText={firstnameError ? 'firstname must be between 3 and 16 characters long and contain only letters' : ''}
                                    variant="outlined"
                                    color="primary"
                                    inputProps={{ maxLength: 16 }}
                                />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    error={lastnameError}
                                    value={form.lastName}
                                    disabled={isSubmitting}
                                    onChange={handleFieldChange}
                                    sx={{ width: "100%" }}
                                    required
                                    id="lastName"
                                    label="Last name"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    helperText={lastnameError ? 'last name must be between 3 and 16 characters long and contain only letters' : ''}
                                    variant="outlined"
                                    color="primary"
                                    inputProps={{ maxLength: 16 }}
                                />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    error={emailError}
                                    value={form.email}
                                    disabled={isSubmitting}
                                    onChange={handleFieldChange}
                                    sx={{ width: "100%" }}
                                    required
                                    id="email"
                                    label="Email"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    helperText={emailError ? 'Invalid email' : ''}
                                    variant="outlined"
                                    color="primary"
                                    inputProps={{ maxLength: 320 }}
                                />
                            </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                style={{ width: "fit-content" }}
                                onClick={() => navigate('/')}
                            >
                                Close
                            </Button>
                            <LoadingButton
                                variant="contained"
                                color="primary"
                                disabled={emailError || firstnameError || tagsError || lastnameError}
                                loading={isSubmitting}
                                size="medium"
                                style={{ width: "fit-content" }}
                                onClick={() => handleSubmit()}
                            >
                                Save
                            </LoadingButton>
                        </Box>
                    </Card>
            }
        </Box>
    )
}

export default ProfilePage