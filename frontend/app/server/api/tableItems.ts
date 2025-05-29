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
    feature: string
    epic: string
    epicId: string
    optimistic_estimation?: number | null
    realistic_estimation?: number | null
    pessimistic_estimation?: number | null
    t_shirt_size?: string | null
    total_estimation?: number | null
    start_date?: string | Date | null
    end_date?: string | Date | null
    extra_coefficient?: number | null
    extra_coefficient_description?: string | null
    progress?: number | null
    employee?: number | null
    priority?: string | null
  }

  try {
    switch (method) {
      case 'GET': {
        const projectId = Number(params.projectId)
        if (isNaN(projectId)) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid project ID' })
        }

        // Получаем проект с вложенными данными
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
                    }
                  }
                }
              }
            }
          }
        })

        if (!project) {
          throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }

        const tasks = project.epics.flatMap(epic =>
          epic.features.flatMap(feature =>
            feature.tasks.map(task => ({
              id: String(task.id),
              name: task.title,
              featureId: String(feature.id),
              feature: feature.title,
              epicId: String(epic.id),
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

        return {
          success: true,
          data: tasks,
        }
      }

      case 'PUT': {
        const projectId = Number(params.projectId)
        if (isNaN(projectId)) {
          throw createError({ statusCode: 400, statusMessage: 'Missing or invalid projectId' })
        }

        const body = await readBody(event) as { items: TaskItem[] }
        const items = body.items || []

        // Проверяем наличие проекта
        const projectExists = await prisma.project.findUnique({
          where: { id: projectId }
        })
        if (!projectExists) {
          throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }

        // Удаляем все эпики/фичи/таски проекта
        await prisma.$transaction([
          prisma.task.deleteMany({
            where: {
              feature: {
                epic: {
                  project_id: projectId
                }
              }
            }
          }),
          prisma.feature.deleteMany({
            where: {
              epic: {
                project_id: projectId
              }
            }
          }),
          prisma.epic.deleteMany({
            where: {
              project_id: projectId
            }
          }),
        ])

        // Создаём эпики (уникальные по epicId)
        const epicIdMap = new Map<string, number>()
        const uniqueEpicIds = [...new Set(items.map(i => i.epicId))]
        for (const epicId of uniqueEpicIds) {
          const epicItem = items.find(i => i.epicId === epicId)
          if (!epicItem) continue

          const epic = await prisma.epic.create({
            data: {
              title: epicItem.epic,
              total_estimation: 0,
              project_id: projectId
            }
          })
          epicIdMap.set(epicId, epic.id)
        }

        // Создаём фичи (уникальные по featureId)
        const featureIdMap = new Map<string, number>()
        const uniqueFeatureIds = [...new Set(items.map(i => i.featureId))]
        for (const featureId of uniqueFeatureIds) {
          const featureItem = items.find(i => i.featureId === featureId)
          if (!featureItem) continue

          const feature = await prisma.feature.create({
            data: {
              title: featureItem.feature,
              total_estimation: 0,
              epic_id: epicIdMap.get(featureItem.epicId)!
            }
          })
          featureIdMap.set(featureId, feature.id)
        }

        // Создаём задачи
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
          employee_id: item.employee ?? null,
        }))

        await prisma.task.createMany({
          data: tasksData
        })

        // Возвращаем успех
        return {
          success: true,
          message: 'Project tasks updated successfully'
        }
      }

      default:
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('[tableItems API Error]', error)
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }))
  }
})
