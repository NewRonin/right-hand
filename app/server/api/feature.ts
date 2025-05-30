import prisma from "~/server/database/client"
import { sendError } from "h3"

interface FeatureCreateBody {
  title: string
  totalEstimation: number
  epicId: number
}

interface FeatureUpdateBody {
  title: string
  totalEstimation: number
}

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        const feature = await prisma.feature.findUnique({
          where: { id },
          include: {
            epic: true,
            tasks: true,
          },
        })

        if (!feature) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Feature not found',
          })
        }

        return { success: true, data: feature }
      }

      case 'POST': {
        const body = await readBody<FeatureCreateBody>(event)

        if (!body.title || body.totalEstimation === undefined || !body.epicId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdFeature = await prisma.feature.create({
          data: {
            title: body.title,
            total_estimation: body.totalEstimation,
            epic_id: body.epicId,
          },
        })

        return { success: true, data: createdFeature }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)
        const body = await readBody<FeatureUpdateBody>(event)

        if (!body.title || body.totalEstimation === undefined) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedFeature = await prisma.feature.update({
          where: { id },
          data: {
            title: body.title,
            total_estimation: body.totalEstimation,
          },
        })

        return { success: true, data: updatedFeature }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        await prisma.feature.delete({
          where: { id },
        })

        return { success: true, message: 'Feature deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[Feature Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
