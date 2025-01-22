import prisma from "~/server/database/client"
import { sendError } from "h3"

interface TaskRoleCreateBody {
  taskId: number
  roleId: number
}

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET': {
        if (!params || !params.taskId || !params.roleId || isNaN(Number(params.taskId)) || isNaN(Number(params.roleId))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid parameters',
          })
        }

        const taskId = Number(params.taskId)
        const roleId = Number(params.roleId)

        const taskRole = await prisma.taskRole.findUnique({
          where: {
            task_id_roles_id: {
              task_id: taskId,
              roles_id: roleId,
            },
          },
        })

        if (!taskRole) {
          throw createError({
            statusCode: 404,
            statusMessage: 'TaskRole not found',
          })
        }

        return { success: true, data: taskRole }
      }

      case 'POST': {
        const body = await readBody<TaskRoleCreateBody>(event)

        if (!body.taskId || !body.roleId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdTaskRole = await prisma.taskRole.create({
          data: {
            task_id: body.taskId,
            roles_id: body.roleId,
          },
        })

        return { success: true, data: createdTaskRole }
      }

      case 'DELETE': {
        if (!params || !params.taskId || !params.roleId || isNaN(Number(params.taskId)) || isNaN(Number(params.roleId))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid parameters',
          })
        }

        const taskId = Number(params.taskId)
        const roleId = Number(params.roleId)

        await prisma.taskRole.delete({
          where: {
            task_id_roles_id: {
              task_id: taskId,
              roles_id: roleId,
            },
          },
        })

        return { success: true, message: 'TaskRole deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[TaskRole Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
