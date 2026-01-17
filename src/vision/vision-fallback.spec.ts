import { PythonVisionService } from './python-vision.service';
import { ImageValidatorService } from './image-validator.service';

describe('Vision Fallback Mode (Unit Test)', () => {
  let visionService: PythonVisionService;
  let imageValidator: ImageValidatorService;

  beforeEach(() => {
    // Remove API keys to force fallback mode
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    process.env.NODE_ENV = 'test';

    visionService = new PythonVisionService();
    imageValidator = new ImageValidatorService();
  });

  describe('PythonVisionService Fallback', () => {
    it('should return fallback result when no API keys configured', async () => {
      const testImageUrl = 'https://picsum.photos/200/300';
      const testChallenge = 'Coletar 10 tampinhas de garrafa PET';

      const result = await visionService.analyzeChallengeImage(
        testImageUrl,
        testChallenge,
        false, // NOT forcing simulation - should auto-detect missing keys
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('Fallback Simulado');
      expect(result.confidence).toBe(0.75);
      expect(result.analysis).toContain('MODO DESENVOLVIMENTO');
      expect(result.analysis).toContain(testChallenge);
      expect(result.analysis).toContain('ANTHROPIC_API_KEY');
      expect(result.analysis).toContain('OPENAI_API_KEY');
    });

    it('should return fallback result when useSimulation is true', async () => {
      const testImageUrl = 'https://picsum.photos/200/300';
      const testChallenge = 'Separar lixo reciclável';

      const result = await visionService.analyzeChallengeImage(
        testImageUrl,
        testChallenge,
        true, // Force simulation
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('Fallback Simulado');
      expect(result.confidence).toBe(0.75);
      expect(result.analysis).toContain('MODO DESENVOLVIMENTO');
      expect(result.analysis).toContain(testChallenge);
    });

    it('should handle long challenge descriptions in fallback mode', async () => {
      const testImageUrl = 'https://picsum.photos/200/300';
      const longChallenge =
        'Coletar 50 tampinhas de garrafa PET de diferentes cores e tamanhos para reciclagem';

      const result = await visionService.analyzeChallengeImage(
        testImageUrl,
        longChallenge,
        true,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.analysis).toContain(longChallenge);
    });

    it('should return consistent results in fallback mode', async () => {
      const testImageUrl = 'https://picsum.photos/200/300';
      const testChallenge = 'Plantar uma árvore';

      const result1 = await visionService.analyzeChallengeImage(
        testImageUrl,
        testChallenge,
        true,
      );
      const result2 = await visionService.analyzeChallengeImage(
        testImageUrl,
        testChallenge,
        true,
      );

      expect(result1.success).toBe(result2.success);
      expect(result1.confidence).toBe(result2.confidence);
      expect(result1.provider).toBe(result2.provider);
    });
  });

  describe('ImageValidatorService in Test Mode', () => {
    it('should accept test URLs in test environment', async () => {
      // Only use picsum.photos as it's reliably accessible
      const testUrls = [
        'https://picsum.photos/200/300',
        'https://picsum.photos/400/400',
      ];

      for (const url of testUrls) {
        const result = await imageValidator.validateImageUrl(url);
        expect(result.isValid).toBe(true);
      }
    }, 10000); // Increase timeout for network requests

    it('should reject obviously invalid URLs', async () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'ftp://invalid.com/image.jpg',
        '',
      ];

      for (const url of invalidUrls) {
        try {
          const result = await imageValidator.validateImageUrl(url);
          expect(result.isValid).toBe(false);
        } catch (error) {
          // Expected to throw for malformed URLs
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing challenge description gracefully', async () => {
      const testImageUrl = 'https://picsum.photos/200/300';
      const emptyChallenge = '';

      const result = await visionService.analyzeChallengeImage(
        testImageUrl,
        emptyChallenge,
        true,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('Fallback Simulado');
    });

    it('should handle special characters in challenge description', async () => {
      const testImageUrl = 'https://picsum.photos/200/300';
      const specialChallenge =
        'Coletar 10 tampinhas "especiais" & símbolos: @#$%^&*()';

      const result = await visionService.analyzeChallengeImage(
        testImageUrl,
        specialChallenge,
        true,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
