import { Button, Card, Modal, Slider, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface BrowsingFiltersModalProps {
    isOpen: boolean
    ageRange: number[]
    eloRange: number[]
    distance: number
    minTags: number
    closeFilters: () => void
    setAgeRange: (value: number[]) => void
    setEloRange: (value: number[]) => void
    setDistance: (value: number) => void
    setMinTags: (value: number) => void
}

const BrowsingFiltersModal = ({
    isOpen,
    ageRange,
    eloRange,
    distance,
    minTags,
    closeFilters,
    setAgeRange,
    setEloRange,
    setDistance,
    setMinTags,
}: BrowsingFiltersModalProps) => {
    return (
        <Modal open={isOpen} onClose={closeFilters}>
            <div className="row justify-content-center p-0 p-2 filtersModal">
                <Card className="col-xs-12 col-sm-12 col-md-10 col-lg-8 col-xl-6 col-xxl-5 pt-3 d-flex w-100 flex-column" elevation={6}>
                    <div className="d-flex justify-content-end align-items-center w-100">
                        <Button className="mb-4 min-width-0" style={{ minWidth: 0 }} onClick={closeFilters}>
                            <CloseIcon color="primary" />
                        </Button>
                    </div>
                    <div className="d-flex align-items-center w-100">
                        <Typography id="age-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Age range
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Age range'}
                            min={18}
                            max={99}
                            style={{ width: '210px', margin: '24px' }}
                            value={ageRange}
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
                    <div className="d-flex align-items-center w-100">
                        <Typography id="elo-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Elo range
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Fame rating range'}
                            min={0}
                            max={1000}
                            step={10}
                            style={{ width: '210px', margin: '24px' }}
                            value={eloRange}
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
                    <div className="d-flex align-items-center w-100">
                        <Typography id="distance-slider" style={{ marginLeft: '24px', marginRight: '24px' }}>
                            Distance max
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Distance max'}
                            min={1}
                            max={200}
                            style={{ width: '210px', margin: '24px' }}
                            valueLabelDisplay="on"
                            aria-labelledby="distance-slider"
                            value={distance}
                            onChange={(_, newValue) => {
                                if (typeof newValue !== 'number') {
                                    return
                                }
                                setDistance(newValue)
                            }}
                        />
                    </div>
                    <div className="d-flex align-items-center justify-content-center w-100">
                        <Typography id="min-tags-slider" style={{ margin: '24px' }}>
                            Minimum common tags
                        </Typography>
                        <Slider
                            getAriaLabel={() => 'Minimum common tags'}
                            min={0}
                            max={20}
                            style={{ minWidth: '190px', margin: '24px' }}
                            valueLabelDisplay="on"
                            aria-labelledby="min-tags-slider"
                            value={minTags}
                            onChange={(_, newValue) => {
                                if (typeof newValue !== 'number') {
                                    return
                                }
                                setMinTags(newValue)
                            }}
                        />
                    </div>
                </Card>
            </div>
        </Modal>
    )
}

export default BrowsingFiltersModal
