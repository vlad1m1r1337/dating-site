import { Button, Card, Chip, Modal, Slider, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { SearchFilterState } from './use-search-profiles'

interface SearchFiltersModalProps {
    isOpen: boolean
    filters: SearchFilterState
    allTags: string[]
    closeFilters: () => void
    toggleWantedTag: (tag: string) => void
    setAgeRange: (value: number[]) => void
    setEloRange: (value: number[]) => void
    setDistance: (value: number) => void
    setMinTags: (value: number) => void
}

const SearchFiltersModal = ({
    isOpen,
    filters,
    allTags,
    closeFilters,
    toggleWantedTag,
    setAgeRange,
    setEloRange,
    setDistance,
    setMinTags,
}: SearchFiltersModalProps) => {
    return (
        <Modal open={isOpen} onClose={closeFilters}>
            <div className="filtersModal">
                <Card className="searchFiltersCard pt-3 d-flex flex-column" elevation={6}>
                    <div className="d-flex justify-content-end align-items-center w-100">
                        <Button className="mb-4 min-width-0" style={{ minWidth: 0 }} onClick={closeFilters}>
                            <CloseIcon color="primary" />
                        </Button>
                    </div>
                    <div className="filterSliderRow">
                        <Typography id="age-slider" className="filterSliderLabel">
                            Age range
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Age range'}
                            min={18}
                            max={99}
                            className="filterSlider"
                            value={filters.ageRange}
                            onChange={(_, newValue) => {
                                if (typeof newValue === 'number') {
                                    return
                                }
                                setAgeRange(newValue)
                            }}
                            valueLabelDisplay="on"
                            aria-labelledby="age-slider"
                        />
                    </div>
                    <div className="filterSliderRow">
                        <Typography id="elo-slider" className="filterSliderLabel">
                            Elo range
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Fame rating range'}
                            min={0}
                            max={1000}
                            step={10}
                            className="filterSlider"
                            value={filters.eloRange}
                            onChange={(_, newValue) => {
                                if (typeof newValue === 'number') {
                                    return
                                }
                                setEloRange(newValue)
                            }}
                            valueLabelDisplay="on"
                            aria-labelledby="elo-slider"
                        />
                    </div>
                    <div className="filterSliderRow">
                        <Typography id="distance-slider" className="filterSliderLabel">
                            Distance max
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Distance max'}
                            min={1}
                            max={200}
                            className="filterSlider"
                            valueLabelDisplay="on"
                            aria-labelledby="distance-slider"
                            value={filters.distance}
                            onChange={(_, newValue) => {
                                if (typeof newValue !== 'number') {
                                    return
                                }
                                setDistance(newValue)
                            }}
                        />
                    </div>
                    <div className="filterSliderRow">
                        <Typography id="min-tags-slider" className="filterSliderLabel">
                            Minimum common tags
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Minimum common tags'}
                            min={0}
                            max={20}
                            className="filterSlider"
                            valueLabelDisplay="on"
                            aria-labelledby="min-tags-slider"
                            value={filters.minTags}
                            onChange={(_, newValue) => {
                                if (typeof newValue !== 'number') {
                                    return
                                }
                                setMinTags(newValue)
                            }}
                        />
                    </div>
                    <Typography style={{ marginLeft: '24px', marginTop: '24px' }}>
                        Tags : {filters.wantedTags.length}
                    </Typography>
                    <div className="tagsContainer">
                        <div className="filtersTagsList">
                            {allTags.map((tag) => {
                                const isWanted = filters.wantedTags.includes(tag)
                                if (isWanted) {
                                    return (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            variant="filled"
                                            color="primary"
                                            className="fw-bold m-0 me-1 mb-1"
                                            onClick={() => { }}
                                            onDelete={() => toggleWantedTag(tag)}
                                        />
                                    )
                                }

                                return (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        variant="outlined"
                                        color="primary"
                                        className="fw-bold m-0 me-1 mb-1"
                                        onClick={() => toggleWantedTag(tag)}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </Card>
            </div>
        </Modal>
    )
}

export default SearchFiltersModal
