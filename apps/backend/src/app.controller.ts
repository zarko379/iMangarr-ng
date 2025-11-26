import {
  Controller,
  Get,
  Post,
  Body,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Ruta que funciona tanto en desarrollo como en producción
const DATA_DIR = path.join(process.cwd(), 'apps/backend/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Creamos la carpeta data si no existe (solo una vez)
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
        fs.writeFileSync(USERS_FILE, '{}', 'utf-8');
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
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error guardando users.json:', err);
      throw new BadRequestException('Error interno del servidor');
    }
  }

  // GET /setup → dice si ya hay administrador o no
  @Get('setup')
  checkSetup() {
    const users = this.loadUsers();
    const setupDone = Object.keys(users).length > 0;
    console.log(`Check setup → ${setupDone ? 'YA existe admin' : 'NO hay admin'}`);
    return { setupDone };
  }

  // POST /setup → crea el primer administrador
  @Post('setup')
  async createAdmin(@Body() body: { username: string; password: string }) {
    console.log('Intentando crear admin →', body.username);

    if (!body?.username || !body?.password) {
      throw new BadRequestException('Faltan usuario o contraseña');
    }

    const users = this.loadUsers();

    if (Object.keys(users).length > 0) {
      throw new ConflictException('El administrador ya fue creado');
    }

    const hash = await bcrypt.hash(body.password, 12);

    users[body.username] = {
      username: body.username,
      passwordHash: hash,
    };

    this.saveUsers(users);
    console.log('Administrador creado con éxito →', body.username);
    return { success: true, message: 'Administrador creado correctamente' };
  }

  // POST /login → inicio de sesión
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    console.log('Intento de login →', body.username);

    const users = this.loadUsers();
    const user = users[body.username];

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isValid = await bcrypt.compare(body.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    console.log('Login exitoso →', body.username);
    return { success: true, message: 'Login correcto' };
  }
}