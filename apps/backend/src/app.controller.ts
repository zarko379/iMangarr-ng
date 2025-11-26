import {
  Controller,
  Get,
  Post,
  Body,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

//const DATA_DIR = path.join(process.cwd(), 'apps/backend/data');
const DATA_DIR = path.join(process.cwd(), '/data/');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Asegúrate de que la carpeta exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface UserData {
  username: string;
  passwordHash: string;
}

@Controller()
export class AppController {
  private loadUsers(): Record<string, UserData> {
    try {
      if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '{}');
        return {};
      }
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return data.trim() ? JSON.parse(data) : {};
    } catch (err) {
      console.error('Error leyendo users.json:', err);
      return {};
    }
  }

  private saveUsers(users: Record<string, UserData>) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Error guardando users.json:', err);
      throw new BadRequestException('Error interno al guardar');
    }
  }

  @Get('setup')
  checkSetup() {
    const users = this.loadUsers();
    console.log('Check setup → usuarios:', Object.keys(users).length);
    return { setupDone: Object.keys(users).length > 0 };
  }

  @Post('setup')
  async createAdmin(@Body() body: { username: string; password: string }) {
    console.log('POST /setup → datos recibidos:', body);

    if (!body?.username || !body?.password) {
      throw new BadRequestException('Faltan username o password');
    }

    const users = this.loadUsers();

    if (Object.keys(users).length > 0) {
      console.log('Ya existe admin → rechazado');
      throw new ConflictException('El administrador ya fue creado');
    }

    const hash = await bcrypt.hash(body.password, 12);
    users[body.username] = {
      username: body.username,
      passwordHash: hash,
    };

    this.saveUsers(users);
    console.log('Admin creado →', body.username);
    return { success: true, message: 'Administrador creado correctamente' };
  }
}