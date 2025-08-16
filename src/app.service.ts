import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from './common/dto/health-check.dto';

@Injectable()
export class AppService {
  private startTime = new Date();

  getHello(): string {
    return 'Olá! API funcionando 🚀';
  }

  getHealthCheck(): HealthCheckResponseDto {
    const uptime = Date.now() - this.startTime.getTime();
    const memoryUsage = process.memoryUsage();

    return {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      info: {
        uptime: this.formatUptime(uptime),
        memory: {
          used: this.formatBytes(memoryUsage.heapUsed),
          total: this.formatBytes(memoryUsage.heapTotal),
        },
      },
    };
  }

  private formatUptime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  private formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + sizes[i];
  }
}
