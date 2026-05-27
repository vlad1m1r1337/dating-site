import goose from '../../assets/goose.jpg'
import { useCallback, useEffect, useState } from "react"
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ReportIcon from '@mui/icons-material/Report';
import { Button, Chip, CircularProgress } from "@mui/material";
import instance from "../api/Instance";
import { ProfileModel } from "./models/ProfileModel";
import CircleIcon from '@mui/icons-material/Circle';
import { StatusListModel } from '../pages/models/StatusListModel';
import { lastActivity } from '../utils/timeUtils';
import ProfileReportModal from './profile-viewer/profile-report-modal';
import ProfileInteractionButtons from './profile-viewer/profile-interaction-buttons';
import ProfileDetails from './profile-viewer/profile-details';

interface ProfileViewerProps {
	profileToGetId: string
	likeProfile?: (profileId: string) => Promise<void>
	skipProfile?: (profileId: string) => Promise<void>
	reportProfile?: (profileId: string, message: string) => Promise<void>
	blockProfile?: (profileId: string) => Promise<void>
	unblockProfile?: (profileId: string) => Promise<void>
	unlikeProfile?: (profileId: string) => Promise<void>
	statusList: StatusListModel
	isHandlingInteraction?: boolean
	previousProfile?: () => void
	nextProfile?: () => void
}

const ProfileViewer = ({ profileToGetId, likeProfile, skipProfile, reportProfile, blockProfile, unblockProfile, unlikeProfile, statusList, isHandlingInteraction, previousProfile, nextProfile }: ProfileViewerProps) => {

	const [imageIndex, setImageIndex] = useState(0)
	const [isReportModalOpened, setIsReportModalOpened] = useState(false)
	const [reportReason, setReportReason] = useState('')
	const [profile, setProfile] = useState<ProfileModel | null>(null)
	const [images, setImages] = useState<HTMLImageElement[]>([])

	const preloadImages = (imagesToPreload: string[]) => {
		const imgArray: HTMLImageElement[] = []
		imagesToPreload.forEach((image) => {
			const img = new Image()
			img.src = import.meta.env.VITE_URL_API + "/image/" + image
			imgArray.push(img)
		})
		setImages(imgArray)
	}

	const getProfileWithId = useCallback(async (id: string) => {
		await instance.get<ProfileModel>('/user/' + id).then((res) => {
			preloadImages(res.data.images)
			setProfile(res.data)
		}).catch(() => {
			setProfile(null)
		})
	}, [])

	const reset = useCallback(() => {
		setImageIndex(0)
		getProfileWithId(profileToGetId)
	}, [getProfileWithId, profileToGetId])

	const resetAndCallFunction = (func: () => Promise<void>) => {
		func().then(() => {
			reset()
		})
	}

	const handlePrevious = () => {
		if (previousProfile) {
			previousProfile()
			return
		}
		setImageIndex((prev) => {
			if (!profile?.images.length) {
				return 0
			}

			if (prev - 1 < 0) {
				return profile.images.length - 1
			}

			return prev - 1
		})
	}

	const handleNext = () => {
		if (nextProfile) {
			nextProfile()
			return
		}
		setImageIndex(profile?.images.length ? (imageIndex + 1) % profile.images.length : 0)
	}

	useEffect(() => {
		reset()
	}, [reset])


	const closeReportModal = () => {
		setIsReportModalOpened(false)
		setReportReason('')
	}

	const getCurrentImageSrc = () => {
		if (imageIndex < images.length && images[imageIndex].src) {
			return images[imageIndex].src
		}

		return goose
	}

	return (
		<div className="profileViewer">
			{profile ?
				<>
					<ProfileReportModal
						isOpen={isReportModalOpened}
						reportReason={reportReason}
						setReportReason={setReportReason}
						closeModal={closeReportModal}
						blockProfile={() => {
							if (blockProfile) {
								blockProfile(profile.id)
								closeReportModal()
							}
						}}
						reportProfile={() => {
							if (reportProfile) {
								reportProfile(profile.id, reportReason)
								closeReportModal()
							}
						}}
					/>
					<div className="position-relative">
						<img src={getCurrentImageSrc()} alt="imgProfile" className="imgProfile" loading="lazy" onError={(e) => { e.currentTarget.src = goose }} />
						{statusList && statusList.users && statusList.users.includes(profile.id) ?
							<Chip label="Online" className="status" icon={<CircleIcon style={{ color: "#4CAF50" }} sx={{ height: "12px", width: "12px" }} />} />
							:
							<Chip label={lastActivity(profile.last_login)} className="status" icon={<CircleIcon style={{ color: "#FF0000" }} sx={{ height: "12px", width: "12px" }} />} />
						}
						{reportProfile &&
							<Button className="reportButton" title="Report this profile" onClick={() => { setIsReportModalOpened(true) }}>
								<ReportIcon fontSize="large" />
							</Button>
						}
						<Button className="beforePhotoButton" onClick={handlePrevious} title={previousProfile ? "Previous profile" : "Previous photo"} disabled={isHandlingInteraction}>
							<NavigateBeforeIcon className="me-2" fontSize="large" />
						</Button>
						<Button className="nextPhotoButton" onClick={handleNext} title={nextProfile ? "Next profile" : "Next photo"} disabled={isHandlingInteraction}>
							<NavigateNextIcon className="ms-2" fontSize="large" />
						</Button>
						<ProfileInteractionButtons
							profile={profile}
							isHandlingInteraction={isHandlingInteraction}
							likeProfile={likeProfile}
							skipProfile={skipProfile}
							unblockProfile={unblockProfile}
							unlikeProfile={unlikeProfile}
							resetAndCallFunction={resetAndCallFunction}
						/>
					</div>
					<ProfileDetails profile={profile} />
				</>

				:

				<div className="skeletonHeight">
					<CircularProgress color="secondary" />
				</div>
			}
		</div>

	)

}

export default ProfileViewer