import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';

describe('FollowController', () => {
  let controller: FollowController;

  const mockFollowService = {
    follow: jest.fn(),
    unfollow: jest.fn(),
    isFollowing: jest.fn(),
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        { provide: FollowService, useValue: mockFollowService },
      ],
    }).compile();

    controller = module.get<FollowController>(FollowController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
