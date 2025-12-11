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
}

export class CompleteStepDto {
  @ApiProperty({
    enum: ['profilePic', 'bio', 'firstChallenge'],
    example: 'profilePic'
  })
  step: 'profilePic' | 'bio' | 'firstChallenge';
}
