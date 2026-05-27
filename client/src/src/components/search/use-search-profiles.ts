import { useCallback, useEffect, useState } from 'react'
import instance from '../../api/Instance'
import { ProfilesModel } from '../models/ProfilesModel'
import { defaultFilterParams } from '../../utils/filtersUtils'

export interface SearchFilterState {
    ageRange: number[]
    eloRange: number[]
    distance: number
    minTags: number
    wantedTags: string[]
}

const defaultSearchFilterState: SearchFilterState = {
    ageRange: [defaultFilterParams.minAge, defaultFilterParams.maxAge],
    eloRange: [defaultFilterParams.minElo, defaultFilterParams.maxElo],
    distance: defaultFilterParams.distance,
    minTags: defaultFilterParams.minTags,
    wantedTags: [],
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
    const currentFilterParams = getStoredFilterParams()
    localStorage.setItem('filterParams', JSON.stringify({ ...currentFilterParams, ...updates }))
}

export const useSearchProfiles = (
    setSuccessAlert: (message: string) => void,
    setErrorAlert: (message: string) => void,
) => {
    const [filters, setFilters] = useState<SearchFilterState>(defaultSearchFilterState)
    const [isProfilesLoading, setIsProfilesLoading] = useState(true)
    const [profiles, setProfiles] = useState<ProfilesModel[]>([])
    const [profileId, setProfileId] = useState<string | null>(null)
    const [isHandlingInteraction, setIsHandlingInteraction] = useState(false)
    const [allTags, setAllTags] = useState<string[]>([])

    const syncFiltersFromStorage = useCallback(() => {
        const filterParams = getStoredFilterParams()

        setFilters((prev) => ({
            ...prev,
            ageRange: [filterParams.minAge || defaultFilterParams.minAge, filterParams.maxAge || defaultFilterParams.maxAge],
            eloRange: [filterParams.minElo ?? defaultFilterParams.minElo, filterParams.maxElo ?? defaultFilterParams.maxElo],
            distance: filterParams.distance || defaultFilterParams.distance,
            minTags: filterParams.minTags ?? defaultFilterParams.minTags,
        }))
    }, [])

    const fetchTags = useCallback(async () => {
        await instance.get('/tags').then((res) => {
            setAllTags(res.data.tags)
        }).catch(() => {
            setAllTags([])
        })
    }, [])

    const fetchProfiles = useCallback(async () => {
        syncFiltersFromStorage()
        setProfiles([])
        setIsProfilesLoading(true)
        const filterParams = getStoredFilterParams()

        await instance.post('/profiles/queries', {
            min_age: filterParams.minAge,
            max_age: filterParams.maxAge,
            min_elo: filterParams.minElo,
            max_elo: filterParams.maxElo,
            distance: filterParams.distance,
            min_tags: filterParams.minTags,
            wanted_tags: filters.wantedTags,
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
            setProfileId(null)
            setIsProfilesLoading(false)
        })
    }, [filters.wantedTags, setErrorAlert, syncFiltersFromStorage])

    const toggleWantedTag = useCallback((tag: string) => {
        setFilters((prev) => {
            if (prev.wantedTags.includes(tag)) {
                return {
                    ...prev,
                    wantedTags: prev.wantedTags.filter((wantedTag) => wantedTag !== tag),
                }
            }

            return {
                ...prev,
                wantedTags: [...prev.wantedTags, tag],
            }
        })
    }, [])

    const setAgeRange = useCallback((ageRange: number[]) => {
        updateStoredFilterParams({
            minAge: ageRange[0] || defaultFilterParams.minAge,
            maxAge: ageRange[1] || defaultFilterParams.maxAge,
        })
        setFilters((prev) => ({ ...prev, ageRange }))
    }, [])

    const setEloRange = useCallback((eloRange: number[]) => {
        updateStoredFilterParams({ minElo: eloRange[0], maxElo: eloRange[1] })
        setFilters((prev) => ({ ...prev, eloRange }))
    }, [])

    const setDistance = useCallback((distance: number) => {
        updateStoredFilterParams({ distance: distance || defaultFilterParams.distance })
        setFilters((prev) => ({ ...prev, distance }))
    }, [])

    const setMinTags = useCallback((minTags: number) => {
        updateStoredFilterParams({ minTags })
        setFilters((prev) => ({ ...prev, minTags }))
    }, [])

    const likeProfile = useCallback(async (profileIdToLike: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToLike}/like`).finally(() => {
            setIsHandlingInteraction(false)
        })
    }, [])

    const skipProfile = useCallback(async (profileIdToSkip: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToSkip}/skip`).finally(() => {
            setProfileId(null)
            setIsHandlingInteraction(false)
            fetchProfiles()
        })
    }, [fetchProfiles])

    const reportProfile = useCallback(async (profileIdToReport: string, message: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToReport}/report`, { message }).then(() => {
            fetchProfiles()
            setSuccessAlert('Profile reported')
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }, [fetchProfiles, setSuccessAlert])

    const blockProfile = useCallback(async (profileIdToBlock: string) => {
        setIsHandlingInteraction(true)
        await instance.post(`/user/${profileIdToBlock}/block`).then(() => {
            fetchProfiles()
            setSuccessAlert('Profile blocked')
        }).finally(() => {
            setIsHandlingInteraction(false)
        })
    }, [fetchProfiles, setSuccessAlert])

    const unblockProfile = useCallback(async (profileIdToUnblock: string) => {
        setIsHandlingInteraction(true)
        await instance.delete(`/user/${profileIdToUnblock}/block`).finally(() => {
            setIsHandlingInteraction(false)
        })
    }, [])

    const unlikeProfile = useCallback(async (profileIdToUnlike: string) => {
        setIsHandlingInteraction(true)
        await instance.delete(`/user/${profileIdToUnlike}/like`).finally(() => {
            setIsHandlingInteraction(false)
        })
    }, [])

    useEffect(() => {
        fetchProfiles()
        fetchTags()
    }, [fetchProfiles, fetchTags])

    return {
        filters,
        profiles,
        isProfilesLoading,
        profileId,
        isHandlingInteraction,
        allTags,
        setProfiles,
        setProfileId,
        fetchProfiles,
        syncFiltersFromStorage,
        toggleWantedTag,
        setAgeRange,
        setEloRange,
        setDistance,
        setMinTags,
        likeProfile,
        skipProfile,
        reportProfile,
        blockProfile,
        unblockProfile,
        unlikeProfile,
    }
}
