import { useCallback, useEffect, useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import ProfileViewer from '../components/ProfileViewer'
import instance from '../api/Instance'
import { ProfilesModel } from '../components/models/ProfilesModel'
import AvatarPlaceholder from './AvatarPlaceholder'
import { checkFilterParams, defaultFilterParams } from '../utils/filtersUtils'
import SortProfilesComponent from './sortProfiles'
import { StatusListModel } from '../pages/models/StatusListModel'
import BrowsingFiltersModal from './browsing/browsing-filters-modal'

interface BrowsingProps {
    setErrorAlert: (message: string) => void
    setSuccessAlert: (message: string) => void
    statusList: StatusListModel
}

const getStoredFilterParams = () => {
    try {
        return JSON.parse(localStorage.getItem('filterParams') || '{}')
    } catch {
        localStorage.setItem('filterParams', JSON.stringify(defaultFilterParams))
        return defaultFilterParams
    }
}

const updateStoredFilterParams = (updates: Partial<typeof defaultFilterParams>) => {
    const filterParams = getStoredFilterParams()
    localStorage.setItem('filterParams', JSON.stringify({ ...filterParams, ...updates }))
}

const Browsing = ({ setErrorAlert, setSuccessAlert, statusList }: BrowsingProps) => {
    const [isProfilesLoading, setIsProfilesLoading] = useState(true)
    const [profileIndex, setProfileIndex] = useState(0)
    const [isHandlingInteraction, setIsHandlingInteraction] = useState(false)
    const [profiles, setProfiles] = useState<ProfilesModel[]>([])
    const [isFiltersModalOpened, setIsFiltersModalOpened] = useState(false)
    const [ageSliderValue, setAgeSliderValue] = useState<number[]>([18, 99])
    const [eloSliderValue, setEloSliderValue] = useState<number[]>([20, 1000])
    const [distanceSliderValue, setDistanceSliderValue] = useState<number>(50)
    const [minTagsSliderValue, setMinTagsSliderValue] = useState<number>(1)

    const syncFiltersFromStorage = useCallback(() => {
        checkFilterParams(setAgeSliderValue, setEloSliderValue, setDistanceSliderValue, setMinTagsSliderValue)
    }, [])

    const getProfiles = useCallback(async () => {
        syncFiltersFromStorage()
        setProfiles([])
        setProfileIndex(0)
        setIsProfilesLoading(true)
        const filterParams = getStoredFilterParams()

        await instance.post('/profiles/queries', {
            min_age: filterParams.minAge,
            max_age: filterParams.maxAge,
            min_elo: filterParams.minElo,
            max_elo: filterParams.maxElo,
            distance: filterParams.distance,
            min_tags: filterParams.minTags,
            wanted_tags: [],
        }).then((res) => {
            setProfiles(res.data.profiles)
        }).catch((err) => {
            const message = err.response?.data.message
            if (!message) {
                return
            }

            if (String(message).includes('Missing key(s)')) {
                syncFiltersFromStorage()
                return
            }

            setErrorAlert(message)
        }).finally(() => {
            setIsProfilesLoading(false)
        })
    }, [setErrorAlert, syncFiltersFromStorage])

    const advanceProfile = () => {
        if (profileIndex === profiles.length - 1) {
            getProfiles()
            return
        }

        setProfileIndex(prev => prev + 1)
    }

    const handleInteraction = async (request: Promise<unknown>, successMessage?: string) => {
        setIsHandlingInteraction(true)
        await request.then(() => {
            advanceProfile()
            if (successMessage) {
                setSuccessAlert(successMessage)
            }
        }).catch((err) => {
            setErrorAlert(err.response?.data.message || 'Could not update profile')
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }

    const closeFilters = () => {
        setIsFiltersModalOpened(false)
        getProfiles()
    }

    const previousProfile = () => {
        setProfileIndex(prev => prev === 0 ? profiles.length - 1 : prev - 1)
    }

    const nextProfile = () => {
        setProfileIndex(prev => (prev + 1) % profiles.length)
    }

    useEffect(() => {
        getProfiles()
    }, [getProfiles])

    const renderContent = () => {
        if (isProfilesLoading) {
            return (
                <div className="skeletonHeight">
                    <CircularProgress color="secondary" />
                </div>
            )
        }

        if (profiles.length > 0 && profileIndex < profiles.length) {
            return (
                <ProfileViewer
                    profileToGetId={profiles[profileIndex].id}
                    likeProfile={(profileId) => handleInteraction(instance.post(`/user/${profileId}/like`))}
                    skipProfile={(profileId) => handleInteraction(instance.post(`/user/${profileId}/skip`))}
                    reportProfile={(profileId, message) => handleInteraction(instance.post(`/user/${profileId}/report`, { message }), 'Profile reported')}
                    blockProfile={(profileId) => handleInteraction(instance.post(`/user/${profileId}/block`), 'Profile blocked')}
                    unblockProfile={(profileId) => handleInteraction(instance.delete(`/user/${profileId}/block`))}
                    unlikeProfile={(profileId) => handleInteraction(instance.delete(`/user/${profileId}/like`))}
                    statusList={statusList}
                    isHandlingInteraction={isHandlingInteraction}
                    previousProfile={previousProfile}
                    nextProfile={nextProfile}
                />
            )
        }

        return (
            <div className="skeletonHeight">
                <AvatarPlaceholder className="w-100" />
            </div>
        )
    }

    return (
        <div className="BrowsingParent w-100 h-100">
            <BrowsingFiltersModal
                isOpen={isFiltersModalOpened}
                ageRange={ageSliderValue}
                eloRange={eloSliderValue}
                distance={distanceSliderValue}
                minTags={minTagsSliderValue}
                closeFilters={closeFilters}
                setAgeRange={(value) => {
                    updateStoredFilterParams({ minAge: value[0] || defaultFilterParams.minAge, maxAge: value[1] || defaultFilterParams.maxAge })
                    setAgeSliderValue(value)
                }}
                setEloRange={(value) => {
                    updateStoredFilterParams({ minElo: value[0], maxElo: value[1] })
                    setEloSliderValue(value)
                }}
                setDistance={(value) => {
                    updateStoredFilterParams({ distance: value || defaultFilterParams.distance })
                    setDistanceSliderValue(value)
                }}
                setMinTags={(value) => {
                    updateStoredFilterParams({ minTags: value })
                    setMinTagsSliderValue(value)
                }}
            />
            <SortProfilesComponent profiles={profiles} setProfiles={setProfiles} />
            <Button className="filtersButton me-3 mt-3" onClick={() => { syncFiltersFromStorage(); setIsFiltersModalOpened(true) }} title="Filters">
                <TuneRoundedIcon color="primary" />
            </Button>
            {renderContent()}
        </div>
    )
}

export default Browsing
