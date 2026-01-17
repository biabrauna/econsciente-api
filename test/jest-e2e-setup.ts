/**
 * Jest E2E Test Setup
 * Configura ambiente de teste removendo API keys para forçar modo fallback
 */

// Remove API keys para forçar modo fallback nos testes
delete process.env.ANTHROPIC_API_KEY;
delete process.env.OPENAI_API_KEY;

// Força modo de desenvolvimento
process.env.NODE_ENV = 'test';

console.log('🧪 [Test Setup] API keys removidas para testes em modo fallback');
