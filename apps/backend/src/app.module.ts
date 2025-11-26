import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],  // ← PrismaService eliminado
})
export class AppModule {}