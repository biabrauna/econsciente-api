import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Dados de entrada inválidos',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          path: { type: 'string', example: '/api/endpoint' }
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: 'Token de acesso inválido ou ausente',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          path: { type: 'string', example: '/api/endpoint' }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Recurso não encontrado',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Resource not found' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          path: { type: 'string', example: '/api/endpoint' }
        }
      }
    }),
    ApiResponse({
      status: 500,
      description: 'Erro interno do servidor',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          path: { type: 'string', example: '/api/endpoint' }
        }
      }
    })
  );
}