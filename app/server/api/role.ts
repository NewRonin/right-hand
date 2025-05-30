import prisma from "~/server/database/client"
import { sendError } from "h3"

interface RoleCreateBody {
  displayName: string
  name: string
}

interface RoleUpdateBody {
  displayName: string
  name: string
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const params = getQuery(event)

  try {
    switch (method) {
      case 'GET': {
        // GET by ID
        if (params.id) {
          const id = Number(params.id)
          if (isNaN(id)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
          }

          const role = await prisma.role.findUnique({
            where: { id },
            include: {
              employees: true,
              tasks: true,
            },
          })

          if (!role) {
            throw createError({ statusCode: 404, statusMessage: 'Role not found' })
          }

          return { success: true, data: role }
        }

        // GET all
        const roles = await prisma.role.findMany()
        return { success: true, data: roles }
      }

      case 'POST': {
        const body = await readBody<RoleCreateBody>(event)

        if (!body.displayName || !body.name) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const createdRole = await prisma.role.create({
          data: {
            display_name: body.displayName,
            name: body.name,
          },
        })

        return { success: true, data: createdRole }
      }

      case 'PUT': {
        const id = Number(params.id)
        if (!params.id || isNaN(id)) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }

        const body = await readBody<RoleUpdateBody>(event)

        if (!body.displayName || !body.name) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedRole = await prisma.role.update({
          where: { id },
          data: {
            display_name: body.displayName,
            name: body.name,
          },
        })

        return { success: true, data: updatedRole }
      }

      case 'DELETE': {
        const id = Number(params.id)
        if (!params.id || isNaN(id)) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }

        await prisma.role.delete({
          where: { id },
        })

        return { success: true, message: 'Role deleted successfully' }
      }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('[Role Handler Error]', error)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }))
  }
})
