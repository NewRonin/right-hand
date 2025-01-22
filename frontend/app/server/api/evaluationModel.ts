import prisma from "~/server/database/client"
import { sendError } from "h3"

interface EvaluationModelCreateBody {
  title: string
}

interface EvaluationModelUpdateBody {
  title: string
}

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const method = getMethod(event)

  // Обработка запросов
  try {
    switch (method) {
      case 'GET': {
        // Получение модели оценки по ID
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        const evaluationModel = await prisma.evaluationModel.findUnique({
          where: { id },
          include: {
            projects: true,  // Включаем проекты, связанные с моделью
          },
        })

        if (!evaluationModel) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Evaluation Model not found',
          })
        }

        return { success: true, data: evaluationModel }
      }

      case 'POST': {
        // Создание новой модели оценки
        const body = await readBody<EvaluationModelCreateBody>(event)

        if (!body.title) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing title parameter',
          })
        }

        const createdEvaluationModel = await prisma.evaluationModel.create({
          data: {
            title: body.title,
          },
        })

        return { success: true, data: createdEvaluationModel }
      }

      case 'PUT': {
        // Обновление существующей модели оценки
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)
        const body = await readBody<EvaluationModelUpdateBody>(event)

        if (!body.title) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Missing or invalid body parameters',
          })
        }

        const updatedEvaluationModel = await prisma.evaluationModel.update({
          where: { id },
          data: {
            title: body.title,
          },
        })

        return { success: true, data: updatedEvaluationModel }
      }

      case 'DELETE': {
        // Проверка на наличие проектов, связанных с моделью оценки
        if (!params || !params.id || isNaN(Number(params.id))) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID parameter',
          })
        }

        const id = Number(params.id)

        const relatedProjects = await prisma.project.count({
          where: { evaluation_model_id: id },
        })

        if (relatedProjects > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete EvaluationModel, it is linked to one or more projects.',
          })
        }

        await prisma.evaluationModel.delete({
          where: { id },
        })

        return { success: true, message: 'EvaluationModel deleted successfully' }
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed',
        })
    }
  } catch (error) {
    console.error('[EvaluationModel Handler Error]', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
