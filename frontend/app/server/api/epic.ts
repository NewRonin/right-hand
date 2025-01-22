import prisma from "~/server/database/client"
import { sendError } from "h3"

interface EpicCreateBody {
  title: string
  totalEstimation: number
  projectId: number
}

interface EpicUpdateBody {
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

        const epic = await prisma.epic.findUnique({
          where: { id },
          include: {
            features: true,
            project: true,
          },
        })

        if (!epic) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Epic not found',
          })
        }

        return { success: true, data: epic }
      }

      case 'POST': {
        const body = await readBody<EpicCreateBody>(event)

        if (!body.title || body.totalEstimation === undefined || !body.projectId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdEpic = await prisma.epic.create({
          data: {
            title: body.title,
            total_estimation: body.totalEstimation,
            project_id: body.projectId,
          },
        })

        return { success: true, data: createdEpic }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)
        const body = await readBody<EpicUpdateBody>(event)

        if (!body.title || body.totalEstimation === undefined) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedEpic = await prisma.epic.update({
          where: { id },
          data: {
            title: body.title,
            total_estimation: body.totalEstimation,
          },
        })

        return { success: true, data: updatedEpic }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        await prisma.epic.delete({
          where: { id },
        })

        return { success: true, message: 'Epic deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[Epic Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
