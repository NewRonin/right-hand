import prisma from "~/server/database/client"
import { sendError } from "h3"

interface RoleCreateBody {
  displayName: string
  seniorityCoefficient: number
}

interface RoleUpdateBody {
  displayName: string
  seniorityCoefficient: number
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

        const role = await prisma.role.findUnique({
          where: { id },
          include: {
            employees: true,
            tasks: true,
          },
        })

        if (!role) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Role not found',
          })
        }

        return { success: true, data: role }
      }

      case 'POST': {
        const body = await readBody<RoleCreateBody>(event)

        if (!body.displayName || body.seniorityCoefficient === undefined) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdRole = await prisma.role.create({
          data: {
            display_name: body.displayName,
            seniority_coefficient: body.seniorityCoefficient,
          },
        })

        return { success: true, data: createdRole }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)
        const body = await readBody<RoleUpdateBody>(event)

        if (!body.displayName || body.seniorityCoefficient === undefined) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedRole = await prisma.role.update({
          where: { id },
          data: {
            display_name: body.displayName,
            seniority_coefficient: body.seniorityCoefficient,
          },
        })

        return { success: true, data: updatedRole }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        await prisma.role.delete({
          where: { id },
        })

        return { success: true, message: 'Role deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[Role Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
