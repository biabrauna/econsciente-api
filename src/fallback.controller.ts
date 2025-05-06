import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class FallbackController {
  @Get('*')
  serveFrontend(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  }
}
