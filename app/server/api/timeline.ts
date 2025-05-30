import prisma from "~/server/database/client"
import { sendError } from "h3"

interface TimelineCreateBody {
  taskId: number
  projectId: number
  dateStart?: string
  dateEnd?: string
}

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET': {
        if (!params || !params.taskId || !params.projectId || isNaN(Number(params.taskId)) || isNaN(Number(params.projectId))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid parameters',
          })
        }

        const taskId = Number(params.taskId)
        const projectId = Number(params.projectId)

        const timeline = await prisma.timeline.findUnique({
          where: {
            task_id_project_id: {
              task_id: taskId,
              project_id: projectId,
            },
          },
        })

        if (!timeline) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Timeline not found',
          })
        }

        return { success: true, data: timeline }
      }

      case 'POST': {
        const body = await readBody<TimelineCreateBody>(event)

        if (!body.taskId || !body.projectId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdTimeline = await prisma.timeline.create({
          data: {
            task_id: body.taskId,
            project_id: body.projectId,
            date_start: body.dateStart ? new Date(body.dateStart) : undefined,
            date_end: body.dateEnd ? new Date(body.dateEnd) : undefined,
          },
        })

        return { success: true, data: createdTimeline }
      }

      case 'DELETE': {
        if (!params || !params.taskId || !params.projectId || isNaN(Number(params.taskId)) || isNaN(Number(params.projectId))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid parameters',
          })
        }

        const taskId = Number(params.taskId)
        const projectId = Number(params.projectId)

        await prisma.timeline.delete({
          where: {
            task_id_project_id: {
              task_id: taskId,
              project_id: projectId,
            },
          },
        })

        return { success: true, message: 'Timeline deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[Timeline Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
