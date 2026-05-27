import { Button, Card, Chip, Modal, Slider, Stack, Typography } from '@mui/material'
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
            <div className="row justify-content-center p-0 p-2 filtersModal">
                <Card className="col-xs-12 col-sm-12 col-md-10 col-lg-8 col-xl-6 col-xxl-5 pt-3 d-flex w-100 flex-column" elevation={6}>
                    <div className="d-flex justify-content-end align-items-center w-100">
                        <Button className="mb-4 min-width-0" style={{ minWidth: 0 }} onClick={closeFilters}>
                            <CloseIcon color="primary" />
                        </Button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center w-100">
                        <Typography id="age-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Age range
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Age range'}
                            min={18}
                            max={99}
                            style={{ minWidth: '190px', margin: '24px' }}
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
                    <div className="d-flex align-items-center justify-content-center w-100">
                        <Typography id="elo-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Elo range
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Fame rating range'}
                            min={0}
                            max={1000}
                            step={10}
                            style={{ minWidth: '190px', margin: '24px' }}
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
                    <div className="d-flex align-items-center justify-content-center w-100">
                        <Typography id="distance-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Distance max
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Distance max'}
                            min={1}
                            max={200}
                            style={{ minWidth: '190px', margin: '24px' }}
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
                    <div className="d-flex align-items-center justify-content-center w-100">
                        <Typography id="min-tags-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Minimum common tags
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Minimum common tags'}
                            min={0}
                            max={20}
                            style={{ minWidth: '190px', margin: '24px' }}
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
                    <div className="overflow-y-scroll tagsContainer" style={{ height: '130px', margin: '24px' }}>
                        <Stack direction="row" spacing={1} className="flex-wrap">
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
                        </Stack>
                    </div>
                </Card>
            </div>
        </Modal>
    )
}

export default SearchFiltersModal
