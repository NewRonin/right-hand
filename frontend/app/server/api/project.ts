import prisma from "~/server/database/client"
import { getQuery, getMethod, readBody, createError } from "h3"
import { sendError } from "h3"

interface ProjectUpdateBody {
  title: string
  description?: string
  evaluationModelId: number
}

interface ProjectCreateBody {
  title: string
  description?: string
  evaluationModelId: number
}

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET': {
        if (!params || !params.id) {
          const projects = await prisma.project.findMany({
            include: {
              evaluationModel: true,
            },
          })
          return { success: true, data: projects }
        }
      
        const id = Number(params.id)
        if (isNaN(id)) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }
      
        const project = await prisma.project.findUnique({
          where: { id },
          include: {
            evaluationModel: true,
          },
        })
      
        if (!project) {
          throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }
      
        return { success: true, data: project }
      }
      

      case 'POST': {
        const body = await readBody<ProjectCreateBody>(event)

        if (!body.title || !body.evaluationModelId) {
          throw createError({ statusCode: 400, statusMessage: 'Missing or invalid body parameters' })
        }

        const createdProject = await prisma.project.create({
          data: {
            title: body.title,
            description: body.description,
            evaluationModelId: body.evaluationModelId,
          },
        })

        return { success: true, data: createdProject }
      }

      case 'PUT': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }

        const id = Number(params.id)
        const body = await readBody<ProjectUpdateBody>(event)

        if (!body.title || !body.evaluationModelId) {
          throw createError({ statusCode: 400, statusMessage: 'Missing or invalid body parameters' })
        }

        const updatedProject = await prisma.project.update({
          where: { id },
          data: {
            title: body.title,
            description: body.description,
            evaluationModelId: body.evaluationModelId,
          },
        })

        return { success: true, data: updatedProject }
      }

      case 'DELETE': {
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid ID parameter' })
        }

        const id = Number(params.id)

        const existing = await prisma.project.findUnique({ where: { id } })
        if (!existing) {
          throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }

        await prisma.project.delete({ where: { id } })

        return { success: true, message: 'Project deleted successfully' }
      }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('[Project Handler Error]', error)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }))
  }
})
