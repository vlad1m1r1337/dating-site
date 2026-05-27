import { Badge, BadgeProps, styled } from '@mui/material'

const OnlineBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': {
        border: '1px solid',
        width: '14px',
        height: '14px',
        minWidth: '14px',
        color: '#FFFFFF',
        backgroundColor: '#4CAF50',
    },
}))

export default OnlineBadge
