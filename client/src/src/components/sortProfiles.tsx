import { useState } from "react"
import { Button, ButtonGroup, Card, Modal } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import { ProfilesModel } from "./models/ProfilesModel";

enum SORT_DIRECTIONS {
    ASCENDING = 'asc',
    DESCENDING = 'desc',
    NULL = 0,
}

enum SORT_CATEGORIES {
    AGE = 'age',
    ELO = 'elo',
    DISTANCE = 'distance',
    COMMONTAGS = 'commonTags',
}

interface SortProfilesComponentProps {
    profiles: ProfilesModel[]
    setProfiles: (profiles: ProfilesModel[]) => void
}

const SortProfilesComponent = ({ profiles, setProfiles }: SortProfilesComponentProps) => {
    const [sortParams, setSortParams] = useState({
        age: SORT_DIRECTIONS.NULL,
        elo: SORT_DIRECTIONS.NULL,
        distance: SORT_DIRECTIONS.NULL,
        commonTags: SORT_DIRECTIONS.NULL,
    })
    const [isSortModalOpened, setIsSortModalOpened] = useState(false)

    const renderSortIcon = (sortDirection: SORT_DIRECTIONS) => {
        if (sortDirection === SORT_DIRECTIONS.ASCENDING) {
            return <NorthEastIcon color="primary" />
        }

        if (sortDirection === SORT_DIRECTIONS.DESCENDING) {
            return <SouthEastIcon color="primary" />
        }

        return <SwapVertIcon color="primary" />
    }

    const sortProfiles = (sort: SORT_CATEGORIES) => {
        const sortedProfiles = [...profiles]
        switch (sort) {
            case SORT_CATEGORIES.AGE:
                sortedProfiles.sort((a, b) => {
                    if (sortParams.age === SORT_DIRECTIONS.ASCENDING)
                        return a.age - b.age
                    else
                        return b.age - a.age
                })
                setSortParams(prev => ({ ...prev, age: prev.age === SORT_DIRECTIONS.ASCENDING ? SORT_DIRECTIONS.DESCENDING : SORT_DIRECTIONS.ASCENDING, elo: SORT_DIRECTIONS.NULL, distance: SORT_DIRECTIONS.NULL, commonTags: SORT_DIRECTIONS.NULL }))
                break
            case SORT_CATEGORIES.ELO:
                sortedProfiles.sort((a, b) => {
                    if (sortParams.elo === SORT_DIRECTIONS.ASCENDING)
                        return a.elo - b.elo
                    else
                        return b.elo - a.elo
                })
                setSortParams(prev => ({ ...prev, elo: prev.elo === SORT_DIRECTIONS.ASCENDING ? SORT_DIRECTIONS.DESCENDING : SORT_DIRECTIONS.ASCENDING, age: SORT_DIRECTIONS.NULL, distance: SORT_DIRECTIONS.NULL, commonTags: SORT_DIRECTIONS.NULL }))
                break
            case SORT_CATEGORIES.DISTANCE:
                sortedProfiles.sort((a, b) => {
                    if (sortParams.distance === SORT_DIRECTIONS.ASCENDING)
                        return a.distance - b.distance
                    else
                        return b.distance - a.distance
                })
                setSortParams(prev => ({ ...prev, distance: prev.distance === SORT_DIRECTIONS.ASCENDING ? SORT_DIRECTIONS.DESCENDING : SORT_DIRECTIONS.ASCENDING, age: SORT_DIRECTIONS.NULL, elo: SORT_DIRECTIONS.NULL, commonTags: SORT_DIRECTIONS.NULL }))
                break
            case SORT_CATEGORIES.COMMONTAGS:
                sortedProfiles.sort((a, b) => {
                    if (sortParams.commonTags === SORT_DIRECTIONS.ASCENDING)
                        return a.commonTags.length - b.commonTags.length
                    else
                        return b.commonTags.length - a.commonTags.length
                })
                setSortParams(prev => ({ ...prev, commonTags: prev.commonTags === SORT_DIRECTIONS.ASCENDING ? SORT_DIRECTIONS.DESCENDING : SORT_DIRECTIONS.ASCENDING, age: SORT_DIRECTIONS.NULL, elo: SORT_DIRECTIONS.NULL, distance: SORT_DIRECTIONS.NULL }))
                break
            default:
                break
        }
        setProfiles(sortedProfiles)
    }

    return (
        <>
            <Modal
                open={isSortModalOpened}
                onClose={() => { setIsSortModalOpened(false) }}
            >
                <div className="row justify-content-center p-0 p-2 filtersModal">
                    <Card className="col-xs-12 col-sm-12 col-md-10 col-lg-8 col-xl-6 col-xxl-5 pt-2 d-flex w-100 flex-column" elevation={6}>
                        <div className="d-flex justify-content-end align-items-center w-100">
                            <Button className="mb-2" style={{ minWidth: 0, padding: 0 }} onClick={() => { setIsSortModalOpened(false) }}>
                                <CloseIcon color="primary" />
                            </Button>
                        </div>
                        <div style={{ width: "300px" }} className="d-flex flex-column">
                            <ButtonGroup size="medium" className="mb-2 w-100">
                                <Button key="age" className="w-100 align-items-center" onClick={() => sortProfiles(SORT_CATEGORIES.AGE)}>
                                    <p className="m-0 me-1 mt-1">Age</p>
                                    {renderSortIcon(sortParams.age)}
                                </Button>
                                <Button key="commonTags" className="w-100" onClick={() => sortProfiles(SORT_CATEGORIES.COMMONTAGS)}>
                                    <p className="m-0 me-1 mt-1">Common tags</p>
                                    {renderSortIcon(sortParams.commonTags)}
                                </Button>
                            </ButtonGroup>
                            <ButtonGroup size="medium" className="mb-2 w-100">
                                <Button key="location" className="w-100" onClick={() => sortProfiles(SORT_CATEGORIES.DISTANCE)}>
                                    <p className="m-0 me-1 mt-1">Distance</p>
                                    {renderSortIcon(sortParams.distance)}
                                </Button>
                                <Button key="elo" className="w-100" onClick={() => sortProfiles(SORT_CATEGORIES.ELO)}>
                                    <p className="m-0 me-1 mt-1">Fame rating</p>
                                    {renderSortIcon(sortParams.elo)}
                                </Button>
                            </ButtonGroup>
                        </div>
                    </Card>
                </div>
            </Modal>
            <Button className="sortButton ms-3 mt-3" onClick={() => { setIsSortModalOpened(true) }} title="Sort">
                <SortRoundedIcon color="primary" />
            </Button>
        </>
    )
}

export default SortProfilesComponent