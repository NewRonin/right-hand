import prisma from '~/server/database/client'
import { getQuery, getMethod, readBody, createError } from 'h3'
import { sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  type IncomingEpic = {
    id: number
    title: string
    total_estimation: number
  }
  
  type IncomingFeature = {
    id: number
    epic_id: number
    title: string
    total_estimation: number
  }
  
  type IncomingTask = {
    feature_id: number
    title: string
    optimistic_estimation?: number
    realistic_estimation?: number
    pessimistic_estimation?: number
    t_shirt_size?: string
    total_estimation?: number
  }

  try {
    switch (method) {
      case 'GET': {
        const projectId = Number(params.projectId)
        if (isNaN(projectId)) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid project ID' })
        }

        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            epics: {
              include: {
                features: {
                  include: {
                    tasks: true,
                  },
                },
              },
            },
          },
        })

        if (!project) {
          throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }

        const flattened = project.epics.flatMap(epic =>
          epic.features.flatMap(feature =>
            feature.tasks.map(task => ({
              id: `task-${task.id}`,
              name: task.title,
              priority: 'Normal', 
              feature: feature.title,
              featureId: `feature-${feature.id}`,
              epic: epic.title,
              epicId: `epic-${epic.id}`,
            }))
          )
        )

        return { success: true, data: flattened }
      }

      case 'POST': {
        const body = await readBody(event)
        const { projectId, epics = [], features = [], tasks = [] } = body

        if (!projectId) {
          throw createError({ statusCode: 400, statusMessage: 'Missing projectId' })
        }

        const nestedEpics = (epics as IncomingEpic[]).map((epic) => {
          const nestedFeatures = (features as IncomingFeature[])
            .filter((feature) => feature.epic_id === epic.id)
            .map((feature) => {
              const nestedTasks = (tasks as IncomingTask[])
                .filter((task) => task.feature_id === feature.id)
                .map((task) => ({
                  title: task.title,
                  optimistic_estimation: task.optimistic_estimation ?? null,
                  realistic_estimation: task.realistic_estimation ?? null,
                  pessimistic_estimation: task.pessimistic_estimation ?? null,
                  t_shirt_size: task.t_shirt_size ?? null,
                  total_estimation: task.total_estimation ?? null,
                }))
        
              return {
                title: feature.title,
                total_estimation: feature.total_estimation,
                tasks: { create: nestedTasks },
              }
            })
        
          return {
            title: epic.title,
            total_estimation: epic.total_estimation,
            features: { create: nestedFeatures },
          }
        })

        const result = await prisma.project.update({
          where: { id: projectId },
          data: {
            epics: { create: nestedEpics },
          },
        })

        return { success: true, data: result }
      }

      case 'PUT': {
        const body = await readBody(event)
        const { projectId, epics = [], features = [], tasks = [] } = body

        if (!projectId) {
          throw createError({ statusCode: 400, statusMessage: 'Missing projectId' })
        }

        // Delete old nested data
        await prisma.task.deleteMany({
          where: { feature: { epic: { project_id: projectId } } },
        })
        await prisma.feature.deleteMany({
          where: { epic: { project_id: projectId } },
        })
        await prisma.epic.deleteMany({
          where: { project_id: projectId },
        })

        // Create new nested data
        const nestedEpics = (epics as IncomingEpic[]).map((epic) => {
          const nestedFeatures = (features as IncomingFeature[])
            .filter((feature) => feature.epic_id === epic.id)
            .map((feature) => {
              const nestedTasks = (tasks as IncomingTask[])
                .filter((task) => task.feature_id === feature.id)
                .map((task) => ({
                  title: task.title,
                  optimistic_estimation: task.optimistic_estimation ?? null,
                  realistic_estimation: task.realistic_estimation ?? null,
                  pessimistic_estimation: task.pessimistic_estimation ?? null,
                  t_shirt_size: task.t_shirt_size ?? null,
                  total_estimation: task.total_estimation ?? null,
                }))
        
              return {
                title: feature.title,
                total_estimation: feature.total_estimation,
                tasks: { create: nestedTasks },
              }
            })
        
          return {
            title: epic.title,
            total_estimation: epic.total_estimation,
            features: { create: nestedFeatures },
          }
        })

        const result = await prisma.project.update({
          where: { id: projectId },
          data: {
            epics: { create: nestedEpics },
          },
        })

        return { success: true, data: result }
      }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (err) {
    console.error('[tableItems API Error]', err)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }))
  }
})
