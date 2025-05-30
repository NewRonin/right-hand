import prisma from "~/server/database/client"
import { sendError } from "h3"

interface EmployeeCreateBody {
  name: string
  seniorityLevelId: number
  roleId: number
}

interface EmployeeUpdateBody {
  name: string
  seniorityLevelId: number
  roleId: number
}

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET': {
        // Если есть ID — вернуть одного сотрудника, иначе всех
        if (params && params.id && !isNaN(Number(params.id))) {
          const id = Number(params.id)

          const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
              seniorityLevel: true,
              role: true,
              employeesOnProjects: true,
            },
          })

          if (!employee) {
            throw createError({ statusCode: 404, statusMessage: 'Employee not found' })
          }

          return { success: true, data: employee }
        } else {
          const employees = await prisma.employee.findMany({
            include: {
              seniorityLevel: true,
              role: true,
              employeesOnProjects: true,
            },
          })
          return { success: true, data: employees }
        }
      }

      case 'POST': {
        const body = await readBody<EmployeeCreateBody>(event)

        if (!body.name || !body.seniorityLevelId || !body.roleId) {
          throw createError({ statusCode: 400, statusMessage: 'Missing or invalid body parameters' })
        }

        const createdEmployee = await prisma.employee.create({
          data: {
            name: body.name,
            seniority_level_id: body.seniorityLevelId,
            roles_id: body.roleId,
          },
        })

        return { success: true, data: createdEmployee }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }

        const id = Number(params.id)
        const body = await readBody<EmployeeUpdateBody>(event)

        if (!body.name || !body.seniorityLevelId || !body.roleId) {
          throw createError({ statusCode: 400, statusMessage: 'Missing or invalid body parameters' })
        }

        const updatedEmployee = await prisma.employee.update({
          where: { id },
          data: {
            name: body.name,
            seniority_level_id: body.seniorityLevelId,
            roles_id: body.roleId,
          },
        })

        return { success: true, data: updatedEmployee }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }

        const id = Number(params.id)

        await prisma.employee.delete({ where: { id } })

        return { success: true, message: 'Employee deleted successfully' }
      }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('[Employee Handler Error]', error)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }))
  }
})
