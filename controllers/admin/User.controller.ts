import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UserModel, type UserRole, type UserStatus } from '../../models/UserModel.js';
import { hashPassword } from '../../services/password.js';

const roleSchema = z.enum(['peserta', 'staff_presensi']);
const statusSchema = z.enum(['invited', 'active', 'inactive']);
const userFields = {
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  role: roleSchema,
  status: statusSchema,
};
const createSchema = z.object({ ...userFields, password: z.string().min(8).max(128) });
const updateSchema = z.object({ ...userFields, password: z.string().min(8).max(128).optional().or(z.literal('')) });
const idSchema = z.string().regex(/^\d+$/, 'ID user tidak valid');

function publicUser(user: { id: string; user_name: string; email: string | null; role: UserRole; status: UserStatus }) {
  return { id: user.id, name: user.user_name, user_name: user.user_name, email: user.email, role: user.role, status: user.status };
}

function isDuplicateError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';
}

const list: RequestHandler = async (_request, response, next) => {
  try {
    const users = await UserModel.findAll();
    response.json({ users: users.map(publicUser) });
  } catch (error) { next(error); }
};

const detail: RequestHandler = async (request, response, next) => {
  try {
    const id = idSchema.safeParse(request.params.id);
    if (!id.success) { response.status(400).json({ code: 'INVALID_USER_ID', message: 'ID user tidak valid' }); return; }
    const user = await UserModel.findById(id.data);
    if (!user || user.role === 'super_admin') { response.status(404).json({ code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' }); return; }
    response.json({ user: publicUser(user) });
  } catch (error) { next(error); }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const input = createSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ code: 'INVALID_USER_INPUT', message: 'Data user tidak valid', details: input.error.flatten().fieldErrors }); return; }
    const user = await UserModel.create({ userName: input.data.name, email: input.data.email, role: input.data.role, status: input.data.status, passwordHash: await hashPassword(input.data.password) });
    response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (isDuplicateError(error)) { response.status(409).json({ code: 'USER_EMAIL_EXISTS', message: 'Email user sudah digunakan' }); return; }
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const id = idSchema.safeParse(request.params.id);
    const input = updateSchema.safeParse(request.body);
    if (!id.success) { response.status(400).json({ code: 'INVALID_USER_ID', message: 'ID user tidak valid' }); return; }
    if (!input.success) { response.status(400).json({ code: 'INVALID_USER_INPUT', message: 'Data user tidak valid', details: input.error.flatten().fieldErrors }); return; }
    const existing = await UserModel.findById(id.data);
    if (!existing || existing.role === 'super_admin') { response.status(404).json({ code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' }); return; }
    const user = await UserModel.update(id.data, { userName: input.data.name, email: input.data.email, role: input.data.role, status: input.data.status, passwordHash: input.data.password ? await hashPassword(input.data.password) : undefined });
    if (!user) { response.status(404).json({ code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' }); return; }
    response.json({ user: publicUser(user) });
  } catch (error) {
    if (isDuplicateError(error)) { response.status(409).json({ code: 'USER_EMAIL_EXISTS', message: 'Email user sudah digunakan' }); return; }
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const id = idSchema.safeParse(request.params.id);
    if (!id.success) { response.status(400).json({ code: 'INVALID_USER_ID', message: 'ID user tidak valid' }); return; }
    if (request.session.userId === id.data) { response.status(400).json({ code: 'SELF_DELETE_FORBIDDEN', message: 'Akun yang sedang digunakan tidak dapat dihapus' }); return; }
    const existing = await UserModel.findById(id.data);
    if (!existing || existing.role === 'super_admin') { response.status(404).json({ code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' }); return; }
    const deleted = await UserModel.delete(id.data);
    if (!deleted) { response.status(404).json({ code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' }); return; }
    response.status(204).send();
  } catch (error) { next(error); }
};

export const userController = { list, detail, create, update, remove };










