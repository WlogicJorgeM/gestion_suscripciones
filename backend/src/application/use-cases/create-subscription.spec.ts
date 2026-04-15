import { CreateSubscriptionUseCase } from './create-subscription.use-case';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';

describe('CreateSubscriptionUseCase — Validación de fechas', () => {
  const mockUserRepo = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockPlanRepo = {
    findById: jest.fn(),
    findByType: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSubRepo = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    countByStatus: jest.fn(),
  };

  let useCase: CreateSubscriptionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateSubscriptionUseCase(mockSubRepo, mockPlanRepo, mockUserRepo);
  });

  it('debería calcular endDate correctamente para plan de 30 días', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: 'x', fullName: 'Test', role: 'CLIENT' });
    mockPlanRepo.findById.mockResolvedValue({ id: 'p1', name: 'Bronze', type: 'BRONZE', price: 50000, description: '', features: [], durationDays: 30 });
    mockSubRepo.findByUserId.mockResolvedValue([]);
    mockSubRepo.create.mockImplementation((data: Record<string, unknown>) => Promise.resolve({ id: 's1', ...data }));

    await useCase.execute({ userId: 'u1', planId: 'p1' });

    const createCall = mockSubRepo.create.mock.calls[0][0];
    const startDate = new Date(createCall.startDate);
    const endDate = new Date(createCall.endDate);
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(30);
    expect(createCall.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('debería calcular endDate correctamente para plan de 90 días', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: 'x', fullName: 'Test', role: 'CLIENT' });
    mockPlanRepo.findById.mockResolvedValue({ id: 'p2', name: 'Gold', type: 'GOLD', price: 250000, description: '', features: [], durationDays: 90 });
    mockSubRepo.findByUserId.mockResolvedValue([]);
    mockSubRepo.create.mockImplementation((data: Record<string, unknown>) => Promise.resolve({ id: 's2', ...data }));

    await useCase.execute({ userId: 'u1', planId: 'p2' });

    const createCall = mockSubRepo.create.mock.calls[0][0];
    const startDate = new Date(createCall.startDate);
    const endDate = new Date(createCall.endDate);
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(90);
  });

  it('debería lanzar error si el usuario no existe', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'invalid', planId: 'p1' }))
      .rejects.toThrow('User with id invalid not found');
  });

  it('debería lanzar error si el plan no existe', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: 'x', fullName: 'Test', role: 'CLIENT' });
    mockPlanRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'u1', planId: 'invalid' }))
      .rejects.toThrow('Plan with id invalid not found');
  });

  it('debería lanzar error si el usuario ya tiene suscripción activa', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: 'x', fullName: 'Test', role: 'CLIENT' });
    mockPlanRepo.findById.mockResolvedValue({ id: 'p1', name: 'Bronze', type: 'BRONZE', price: 50000, description: '', features: [], durationDays: 30 });
    mockSubRepo.findByUserId.mockResolvedValue([{ id: 's1', status: SubscriptionStatus.ACTIVE }]);

    await expect(useCase.execute({ userId: 'u1', planId: 'p1' }))
      .rejects.toThrow('User already has an active subscription');
  });

  it('debería permitir crear suscripción si las anteriores están expiradas', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: 'x', fullName: 'Test', role: 'CLIENT' });
    mockPlanRepo.findById.mockResolvedValue({ id: 'p1', name: 'Bronze', type: 'BRONZE', price: 50000, description: '', features: [], durationDays: 30 });
    mockSubRepo.findByUserId.mockResolvedValue([{ id: 's1', status: SubscriptionStatus.EXPIRED }]);
    mockSubRepo.create.mockImplementation((data: Record<string, unknown>) => Promise.resolve({ id: 's2', ...data }));

    const result = await useCase.execute({ userId: 'u1', planId: 'p1' });
    expect(result).toBeDefined();
    expect(mockSubRepo.create).toHaveBeenCalled();
  });
});
