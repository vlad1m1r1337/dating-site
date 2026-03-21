import AccountCircleIcon from '@mui/icons-material/AccountCircle'

const AvatarPlaceholder = ({ className }: { className?: string }) => (
    <AccountCircleIcon className={className} sx={{ width: '100%', height: '100%', color: 'grey.500' }} />
)

export default AvatarPlaceholder
