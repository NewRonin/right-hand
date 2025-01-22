import prisma from "~/server/database/client"
import { sendError } from "h3"

interface SeniorityLevelCreateBody {
  name: string
  displayName: string
}

interface SeniorityLevelUpdateBody {
  name: string
  displayName: string
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

        const seniorityLevel = await prisma.seniorityLevel.findUnique({
          where: { id },
          include: {
            employees: true,
          },
        })

        if (!seniorityLevel) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Seniority Level not found',
          })
        }

        return { success: true, data: seniorityLevel }
      }

      case 'POST': {
        const body = await readBody<SeniorityLevelCreateBody>(event)

        if (!body.name || !body.displayName) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdSeniorityLevel = await prisma.seniorityLevel.create({
          data: {
            name: body.name,
            display_name: body.displayName,
          },
        })

        return { success: true, data: createdSeniorityLevel }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)
        const body = await readBody<SeniorityLevelUpdateBody>(event)

        if (!body.name || !body.displayName) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedSeniorityLevel = await prisma.seniorityLevel.update({
          where: { id },
          data: {
            name: body.name,
            display_name: body.displayName,
          },
        })

        return { success: true, data: updatedSeniorityLevel }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        await prisma.seniorityLevel.delete({
          where: { id },
        })

        return { success: true, message: 'Seniority Level deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[SeniorityLevel Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
