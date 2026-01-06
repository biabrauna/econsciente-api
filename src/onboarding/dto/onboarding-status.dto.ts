import { ApiProperty } from '@nestjs/swagger';

export class OnboardingStepsDto {
  @ApiProperty({ example: false })
  profilePic: boolean;

  @ApiProperty({ example: false })
  bio: boolean;

  @ApiProperty({ example: false })
  firstChallenge: boolean;
}

export class OnboardingStatusDto {
  @ApiProperty({ example: false })
  completed: boolean;

  @ApiProperty({ type: OnboardingStepsDto })
  steps: OnboardingStepsDto;

  @ApiProperty({ example: 0 })
  totalPoints: number;

  @ApiProperty({
    example: true,
    description: 'Indica se o onboarding deve ser exibido ao usuário'
  })
  shouldShow: boolean;

  @ApiProperty({
    example: '2026-01-05T12:00:00.000Z',
    required: false,
    description: 'Data/hora em que o onboarding foi pulado pela última vez'
  })
  skippedAt?: Date;
}

export class CompleteStepDto {
  @ApiProperty({
    enum: ['profilePic', 'bio', 'firstChallenge'],
    example: 'profilePic'
  })
  step: 'profilePic' | 'bio' | 'firstChallenge';
}
