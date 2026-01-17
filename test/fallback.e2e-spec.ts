import { PythonVisionService } from '../src/vision/python-vision.service';

describe('Fallback Test', () => {
  let service: PythonVisionService;

  beforeEach(() => {
    service = new PythonVisionService();
  });

  it('should use simulation when no API keys available', async () => {
    const testImageUrl = 'https://example.com/test.jpg';
    const testChallenge = 'Separar lixo reciclável';

    const result = await service.analyzeChallengeImage(
      testImageUrl,
      testChallenge,
      true // Force simulation mode
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.provider).toBe('Fallback Simulado');
    expect(result.confidence).toBe(0.75);
    expect(result.analysis).toContain('MODO DESENVOLVIMENTO');
    expect(result.analysis).toContain(testChallenge);
  });

  it('should return fallback when API keys not configured', async () => {
    const testImageUrl = 'https://example.com/test.jpg';
    const testChallenge = 'Test challenge';

    // When no API keys are configured, it should always use fallback
    const result = await service.analyzeChallengeImage(testImageUrl, testChallenge, false);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.provider).toBe('Fallback Simulado');
    expect(result.confidence).toBe(0.75);
  });
});
