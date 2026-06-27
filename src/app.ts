import cors from 'cors'
import express, { type Application, type Request, type Response } from 'express'

import { envVars } from '@/config/env'
import globalErrorHandler from '@/middlewares/globalErrorHandler'
import notFound from '@/middlewares/notFound'
import router from '@/routes'

const app: Application = express()

app.use(
	cors({
		origin: envVars.FRONTEND_URL,
		credentials: true,
	}),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', router)

app.get('/', async (req: Request, res: Response) => {
	res.status(200).json({
		message: 'Ahar server is running',
		environment: envVars.NODE_ENV,
		uptime: `${process.uptime().toFixed(2)} sec`,
		timeStamp: new Date().toISOString(),
	})
})

app.use(globalErrorHandler)
app.use(notFound)

export default app
