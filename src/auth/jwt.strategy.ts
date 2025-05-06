import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'e93f3e36fdb24b7a9e7e91516c5c3fa8679aabc5ffda13e9b192b62b9c2ec070', // passar pra process.env.JWT_SECRET em produção
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}