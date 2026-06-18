import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import cloudinary from './cloudinary.config'

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: 'ahar',
	} as Record<string, string>,
})

export const upload = multer({ storage })
