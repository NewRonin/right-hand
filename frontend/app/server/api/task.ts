import prisma from "~/server/database/client"
import { sendError } from "h3"
import type { TaskSize } from "@prisma/client"

interface TaskCreateBody {
  title: string
  featureId: number
  optimisticEstimation?: number
  realisticEstimation?: number
  pessimisticEstimation?: number
  tShirtSize?: TaskSize
}

interface TaskUpdateBody {
  title: string
  optimisticEstimation?: number
  realisticEstimation?: number
  pessimisticEstimation?: number
  tShirtSize?: TaskSize
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

        const task = await prisma.task.findUnique({
          where: { id },
          include: {
            feature: true,
            taskRoles: true,
            timelines: true,
          },
        })

        if (!task) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Task not found',
          })
        }

        return { success: true, data: task }
      }

      case 'POST': {
        const body = await readBody<TaskCreateBody>(event)

        if (!body.title || !body.featureId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdTask = await prisma.task.create({
          data: {
            title: body.title,
            feature_id: body.featureId,
            optimistic_estimation: body.optimisticEstimation,
            realistic_estimation: body.realisticEstimation,
            pessimistic_estimation: body.pessimisticEstimation,
            t_shirt_size: body.tShirtSize 
          },
        })

        return { success: true, data: createdTask }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)
        const body = await readBody<TaskUpdateBody>(event)

        if (!body.title) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedTask = await prisma.task.update({
          where: { id },
          data: {
            title: body.title,
            optimistic_estimation: body.optimisticEstimation,
            realistic_estimation: body.realisticEstimation,
            pessimistic_estimation: body.pessimisticEstimation,
            ...(body.tShirtSize && { t_shirt_size: body.tShirtSize })
          },
        })

        return { success: true, data: updatedTask }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        await prisma.task.delete({
          where: { id },
        })

        return { success: true, message: 'Task deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[Task Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
