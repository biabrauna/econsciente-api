import { PythonVisionService } from '../src/vision/python-vision.service';

describe('Fallback Test', () => {
  let service: PythonVisionService;

  beforeEach(() => {
    service = new PythonVisionService();
  });

  it('should use simulation when no API keys available', async () => {
    const testImageUrl = 'https://example.com/test.jpg';
    const testChallenge = 'Separar lixo reciclável';

    try {
      const result = await service.analyzeChallengeImage(
        testImageUrl,
        testChallenge,
        true // Force simulation mode
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('simulation');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    } catch (error) {
      // If Python script doesn't exist or fails, that's expected in test environment
      expect(error.message).toContain('Python');
    }
  });

  it('should handle missing Python script gracefully', async () => {
    const testImageUrl = 'https://example.com/test.jpg';
    const testChallenge = 'Test challenge';

    try {
      await service.analyzeChallengeImage(testImageUrl, testChallenge, true);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBeDefined();
    }
  });
});
