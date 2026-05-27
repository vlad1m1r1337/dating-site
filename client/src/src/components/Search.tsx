import { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import SortProfilesComponent from './sortProfiles'
import ProfileViewer from './ProfileViewer'
import { StatusListModel } from '../pages/models/StatusListModel'
import AvatarPlaceholder from './AvatarPlaceholder'
import SearchFiltersModal from './search/search-filters-modal'
import SearchProfileGrid from './search/search-profile-grid'
import { useSearchProfiles } from './search/use-search-profiles'

interface SearchProps {
    setSuccessAlert: (message: string) => void
    setErrorAlert: (message: string) => void
    statusList: StatusListModel
}

const Search = ({ setSuccessAlert, setErrorAlert, statusList }: SearchProps) => {
    const [isFiltersModalOpened, setIsFiltersModalOpened] = useState(false)
    const {
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
    } = useSearchProfiles(setSuccessAlert, setErrorAlert)

    const openFilters = () => {
        syncFiltersFromStorage()
        setIsFiltersModalOpened(true)
    }

    const closeFilters = () => {
        setIsFiltersModalOpened(false)
        fetchProfiles()
    }

    const renderContent = () => {
        if (isProfilesLoading) {
            return (
                <div className="skeletonHeight">
                    <CircularProgress color="secondary" />
                </div>
            )
        }

        if (profileId) {
            return (
                <div className="searchProfileViewer">
                    <Button className="closeButton" onClick={() => { setProfileId(null) }} title="Close">
                        <CloseIcon color="primary" />
                    </Button>
                    <ProfileViewer
                        profileToGetId={profileId}
                        likeProfile={likeProfile}
                        skipProfile={skipProfile}
                        reportProfile={reportProfile}
                        blockProfile={blockProfile}
                        unblockProfile={unblockProfile}
                        unlikeProfile={unlikeProfile}
                        statusList={statusList}
                        isHandlingInteraction={isHandlingInteraction}
                    />
                </div>
            )
        }

        if (profiles.length) {
            return <SearchProfileGrid profiles={profiles} setProfileId={setProfileId} />
        }

        return (
            <div className="skeletonHeight">
                <AvatarPlaceholder className="w-100" />
            </div>
        )
    }

    return (
        <div className="searchParent w-100 h-100">
            <SearchFiltersModal
                isOpen={isFiltersModalOpened}
                filters={filters}
                allTags={allTags}
                closeFilters={closeFilters}
                toggleWantedTag={toggleWantedTag}
                setAgeRange={setAgeRange}
                setEloRange={setEloRange}
                setDistance={setDistance}
                setMinTags={setMinTags}
            />
            <SortProfilesComponent profiles={profiles} setProfiles={setProfiles} />
            <Button className="filtersButton me-3 mt-3" onClick={openFilters} title="Filters">
                <TuneRoundedIcon color="primary" />
            </Button>
            {renderContent()}
        </div>
    )
}

export default Search