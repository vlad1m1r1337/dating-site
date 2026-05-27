import { Button, Card, Divider, Modal, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface ProfileReportModalProps {
    isOpen: boolean
    reportReason: string
    setReportReason: (value: string) => void
    closeModal: () => void
    blockProfile?: () => void
    reportProfile?: () => void
}

const ProfileReportModal = ({
    isOpen,
    reportReason,
    setReportReason,
    closeModal,
    blockProfile,
    reportProfile,
}: ProfileReportModalProps) => {
    return (
        <Modal open={isOpen} onClose={closeModal}>
            <div className="row justify-content-center p-0 p-2 filtersModal">
                <Card className="col-xs-12 col-sm-12 col-md-10 col-lg-8 col-xl-6 col-xxl-5 pt-2 d-flex w-100 flex-column" elevation={6}>
                    <div className="d-flex justify-content-end align-items-center w-100">
                        <Button className="mb-2" style={{ minWidth: 0, padding: 0 }} onClick={closeModal}>
                            <CloseIcon color="primary" />
                        </Button>
                    </div>
                    <div style={{ width: '300px' }} className="d-flex align-items-center justify-content-center flex-column">
                        <Button className="my-2 w-100" onClick={blockProfile} variant="outlined" color="primary">
                            Block
                        </Button>
                        <Divider sx={{ width: '100%', fontWeight: 'bold' }}>REPORT</Divider>
                        <div className="position-relative w-100">
                            <TextField
                                type="text"
                                label="Report reason"
                                id="reportReason"
                                variant="outlined"
                                className="w-100 pt-2"
                                multiline
                                value={reportReason}
                                inputProps={{ maxLength: 200, minLength: 1 }}
                                style={{ maxHeight: '500px', overflowY: 'scroll' }}
                                InputLabelProps={{ shrink: true, className: 'mt-2' }}
                                onChange={(event) => setReportReason(event.target.value)}
                            />
                            <Typography className="d-sm-block position-absolute bottom-0 end-0 me-3">
                                {reportReason.length}/{200}
                            </Typography>
                        </div>
                        <Button className="my-2 w-100" disabled={reportReason.length < 1} onClick={reportProfile} variant="contained" color="primary">
                            Send
                        </Button>
                    </div>
                </Card>
            </div>
        </Modal>
    )
}

export default ProfileReportModal
