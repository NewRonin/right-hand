import prisma from '~/server/database/client'
import { getQuery, getMethod, readBody, createError } from 'h3'
import { sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  type TaskItem = {
    id?: string
    name: string
    featureId: string
    feature: string,
    epic: string
    epicId: string
    optimistic_estimation?: number
    realistic_estimation?: number
    pessimistic_estimation?: number
    t_shirt_size?: string
    total_estimation?: number
    start_date?: string | Date
    end_date?: string | Date
    extra_coefficient?: number
    extra_coefficient_description?: string
    progress?: number,
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
                    tasks: {
                      include: {
                        taskRoles: {
                          include: {
                            role: true
                          }
                        }
                      }
                    },
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
              id: `${task.id}`,
              name: task.title,
              featureId: `${feature.id}`,
              feature: feature.title,
              epicId: `${epic.id}`,
              epic: epic.title,
              optimistic_estimation: task.optimistic_estimation,
              realistic_estimation: task.realistic_estimation,
              pessimistic_estimation: task.pessimistic_estimation,
              t_shirt_size: task.t_shirt_size,
              total_estimation: task.total_estimation,
              start_date: task.start_date,
              end_date: task.end_date,
              extra_coefficient: task.extra_coefficient,
              extra_coefficient_description: task.extra_coefficient_description,
              progress: task.progress,
              employee: task.employee_id,
              priority: task.taskRoles?.[0]?.role?.display_name || 'Normal',
            }))
          )
        )

        return { success: true, data: flattened }
      }

      case 'POST':
      case 'PUT': {
        const body = await readBody(event)

        const projectId = Number(params.projectId)
        if (isNaN(projectId)) {
          throw createError({ statusCode: 400, statusMessage: 'Missing projectId' })
        }

        const { items = [] } = body as { projectId: number; items: TaskItem[] }

        // Проверяем существование проекта
        const projectExists = await prisma.project.findUnique({
          where: { id: projectId }
        })
        if (!projectExists) {
          throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }

        // Для PUT сначала удаляем существующие данные
        if (method === 'PUT') {
          await prisma.$transaction([
            prisma.task.deleteMany({
              where: { feature: { epic: { project_id: projectId } } },
            }),
            prisma.feature.deleteMany({
              where: { epic: { project_id: projectId } },
            }),
            prisma.epic.deleteMany({
              where: { project_id: projectId },
            }),
          ])
        }

        // Создаем эпики
        const epicIdMap = new Map<string, number>()
        const uniqueEpics = [...new Set(items.map(item => item.epicId))]
        
        for (const epicId of uniqueEpics) {
          const item = items.find(i => i.epicId === epicId)
          const epic = await prisma.epic.create({
            data: {
              title: item?.epic || '',
              total_estimation: 0,
              project_id: projectId,
            },
          })
          epicIdMap.set(epicId, epic.id)
        }

        // Создаем фичи
        const featureIdMap = new Map<string, number>()
        const uniqueFeatures = [...new Set(items.map(item => item.featureId))]
        
        for (const featureId of uniqueFeatures) {
          const item = items.find(i => i.featureId === featureId)
          const feature = await prisma.feature.create({
            data: {
              title: item?.feature || '',
              total_estimation: 0,
              epic_id: epicIdMap.get(item!.epicId)!,
            },
          })
          featureIdMap.set(featureId, feature.id)
        }

        // Создаем задачи
        const tasksData = items.map(item => ({
          title: item.name,
          feature_id: featureIdMap.get(item.featureId)!,
          optimistic_estimation: item.optimistic_estimation ?? null,
          realistic_estimation: item.realistic_estimation ?? null,
          pessimistic_estimation: item.pessimistic_estimation ?? null,
          t_shirt_size: item.t_shirt_size ?? null,
          total_estimation: item.total_estimation ?? null,
          start_date: item.start_date ? new Date(item.start_date) : null,
          end_date: item.end_date ? new Date(item.end_date) : null,
          extra_coefficient: item.extra_coefficient ?? null,
          extra_coefficient_description: item.extra_coefficient_description ?? null,
          progress: item.progress ?? null,
        }))

        await prisma.task.createMany({
          data: tasksData,
        })

        // Получаем обновленный проект с вложенными данными
        const updatedProject = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            epics: {
              include: {
                features: {
                  include: {
                    tasks: {
                      include: {
                        taskRoles: {
                          include: {
                            role: true
                          }
                        }
                      }
                    },
                  },
                },
              },
            },
          },
        })

        return { 
          success: true, 
          data: {
            id: updatedProject?.id,
            evaluationModelId: updatedProject?.evaluationModelId,
            title: updatedProject?.title,
            description: updatedProject?.description,
            epics: updatedProject?.epics.map(epic => ({
              id: epic.id,
              title: epic.title,
              total_estimation: epic.total_estimation,
              features: epic.features.map(feature => ({
                id: feature.id,
                title: feature.title,
                total_estimation: feature.total_estimation,
                tasks: feature.tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  optimistic_estimation: task.optimistic_estimation,
                  realistic_estimation: task.realistic_estimation,
                  pessimistic_estimation: task.pessimistic_estimation,
                  t_shirt_size: task.t_shirt_size,
                  total_estimation: task.total_estimation,
                  start_date: task.start_date,
                  end_date: task.end_date,
                  extra_coefficient: task.extra_coefficient,
                  extra_coefficient_description: task.extra_coefficient_description,
                  progress: task.progress,
                  employee: task.employee_id,
                  priority: task.taskRoles?.[0]?.role?.display_name || 'Normal'
                }))
              }))
            }))
          }
        }
      }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (err) {
    console.error('[tableItems API Error]', err)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }))
  }
})