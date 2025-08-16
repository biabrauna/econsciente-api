import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'João Silva',
    email: 'joao@email.com',
    age: '25',
    biografia: 'Desenvolvedor',
    pontos: 100,
    seguidores: 10,
    seguindo: 5,
    password: 'hashedPassword',
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of users without password', async () => {
      const expectedUsers = [
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          age: mockUser.age,
          biografia: mockUser.biografia,
          pontos: mockUser.pontos,
          seguidores: mockUser.seguidores,
          seguindo: mockUser.seguindo,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          biografia: true,
          pontos: true,
          seguidores: true,
          seguindo: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return user by id without password', async () => {
      const expectedUser = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
        biografia: mockUser.biografia,
        pontos: mockUser.pontos,
        seguidores: mockUser.seguidores,
        seguindo: mockUser.seguindo,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          biografia: true,
          pontos: true,
          seguidores: true,
          seguindo: true,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updateDto = { name: 'João Updated' };
      const updatedUser = { ...mockUser, name: 'João Updated' };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateDto,
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          biografia: true,
          pontos: true,
          seguidores: true,
          seguindo: true,
        },
      });
    });

    it('should throw NotFoundException when user not found for update', async () => {
      const updateDto = { name: 'João Updated' };
      mockPrismaService.user.update.mockRejectedValue(new Error('User not found'));

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete user and return success message', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser.id);

      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found for deletion', async () => {
      mockPrismaService.user.delete.mockRejectedValue(new Error('User not found'));

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});