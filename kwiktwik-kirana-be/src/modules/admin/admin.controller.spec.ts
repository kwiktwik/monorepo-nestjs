import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FourHourEventSchedulerService } from '../razorpay/scheduler/four-hour-event.scheduler';
import { AnalyticsService } from '../analytics/analytics.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    getScripts: jest.fn(),
    runScriptStream: jest.fn(),
  };

  const mockFourHourScheduler = {
    processFourHourEvents: jest.fn(),
  };

  const mockAnalyticsService = {
    sendEvent: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: FourHourEventSchedulerService, useValue: mockFourHourScheduler },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getScripts', () => {
    it('should return scripts list', async () => {
      mockAdminService.getScripts.mockResolvedValue(['script1.mjs', 'script2.mjs']);

      const result = await controller.getScripts();

      expect(result).toEqual({ scripts: ['script1.mjs', 'script2.mjs'] });
    });
  });

  describe('setCookie', () => {
    it('should set cookie successfully', async () => {
      const res = mockResponse();
      const result = await controller.setCookie({ token: 'test-token' }, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'admin_token',
        'test-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it('should return false when token is missing', async () => {
      const res = mockResponse();
      const result = await controller.setCookie({ token: '' }, res);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });
  });

  describe('logout', () => {
    it('should clear cookie', async () => {
      const res = mockResponse();
      const result = await controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('admin_token', { path: '/' });
      expect(result).toEqual({ success: true });
    });
  });

  describe('streamScript', () => {
    it('should stream script output', () => {
      const mockObservable = { subscribe: jest.fn() };
      mockAdminService.runScriptStream.mockReturnValue(mockObservable);

      const mockReq = { query: {} };
      const result = controller.streamScript('test.mjs', mockReq as any);

      expect(mockAdminService.runScriptStream).toHaveBeenCalledWith('test.mjs', []);
      expect(result).toBe(mockObservable);
    });

    it('should parse args from query', () => {
      const mockObservable = { subscribe: jest.fn() };
      mockAdminService.runScriptStream.mockReturnValue(mockObservable);

      const mockReq = { query: { args: '["arg1", "arg2"]' } };
      const result = controller.streamScript('test.mjs', mockReq as any);

      expect(mockAdminService.runScriptStream).toHaveBeenCalledWith('test.mjs', ['arg1', 'arg2']);
    });

    it('should handle invalid args JSON', () => {
      const mockObservable = { subscribe: jest.fn() };
      mockAdminService.runScriptStream.mockReturnValue(mockObservable);

      const mockReq = { query: { args: 'invalid json' } };
      const result = controller.streamScript('test.mjs', mockReq as any);

      expect(mockAdminService.runScriptStream).toHaveBeenCalledWith('test.mjs', []);
    });
  });

  describe('triggerFourHourCron', () => {
    it('should trigger four hour cron', async () => {
      mockFourHourScheduler.processFourHourEvents.mockResolvedValue(undefined);

      const result = await controller.triggerFourHourCron();

      expect(mockFourHourScheduler.processFourHourEvents).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Four hour cron triggered successfully' });
    });
  });

  describe('testAnalytics', () => {
    it('should send test analytics event', async () => {
      mockAnalyticsService.sendEvent.mockResolvedValue({ success: true });

      const result = await controller.testAnalytics('com.test.app');

      expect(mockAnalyticsService.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'test_event',
          appId: 'com.test.app',
        }),
      );
      expect(result).toHaveProperty('result');
    });

    it('should use default appId when not provided', async () => {
      mockAnalyticsService.sendEvent.mockResolvedValue({ success: true });

      await controller.testAnalytics();

      expect(mockAnalyticsService.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'com.kiranaapps.app',
        }),
      );
    });
  });
});
