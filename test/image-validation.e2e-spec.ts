import { ImageValidatorService } from '../src/vision/image-validator.service';

describe('Image Validation Test', () => {
  let service: ImageValidatorService;

  beforeEach(() => {
    service = new ImageValidatorService();
  });

  it('should reject invalid URL', async () => {
    const invalidUrl = 'https://invalid-url-that-does-not-exist-12345.com/image.jpg';
    const result = await service.validateImageUrl(invalidUrl);

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Erro ao acessar URL');
  });

  it('should reject URL with invalid protocol', async () => {
    const invalidUrl = 'ftp://example.com/image.jpg';
    try {
      await service.validateImageUrl(invalidUrl);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should reject non-image content type', async () => {
    const textUrl = 'https://www.google.com';
    const result = await service.validateImageUrl(textUrl);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Tipo de conteúdo inválido');
  });
});
