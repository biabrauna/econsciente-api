import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('[JwtAuthGuard] Verificando autenticação:', {
      url: request.url,
      method: request.method,
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? `${authHeader.substring(0, 30)}...` : 'none'
    });

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('[JwtAuthGuard] handleRequest:', {
      hasError: !!err,
      hasUser: !!user,
      info: info?.message || info,
      userId: user?.id
    });

    if (err || !user) {
      console.error('[JwtAuthGuard] Autenticação falhou:', {
        error: err?.message,
        info: info?.message || info
      });
      throw err || new UnauthorizedException('Token inválido ou ausente');
    }
    return user;
  }
} 