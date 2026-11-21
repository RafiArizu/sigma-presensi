import type { RequestHandler } from 'express';
import { z } from 'zod';
import { createStaffParticipant, findStaffParticipant, listStaffParticipants, removeStaffParticipant, updateStaffParticipant } from '../../services/StaffParticipant.service.js';

const idSchema = z.string().regex(/^\d+$/, 'ID penempatan tidak valid');
const participantSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  phone: z.string().trim().min(6).max(32),
  institutionType: z.enum(['Sekolah', 'Perguruan Tinggi']),
  institutionName: z.string().trim().min(2).max(200),
  programType: z.enum(['PKL', 'Magang/Kerja Praktik']),
  startDate: z.string().date(),
  endDate: z.string().date(),
}).superRefine((value, context) => {
  if (value.institutionType === 'Sekolah' && value.programType !== 'PKL') context.addIssue({ code: 'custom', path: ['programType'], message: 'Sekolah hanya dapat menggunakan PKL' });
  if (value.institutionType === 'Perguruan Tinggi' && value.programType !== 'Magang/Kerja Praktik') context.addIssue({ code: 'custom', path: ['programType'], message: 'Perguruan Tinggi hanya dapat menggunakan Magang/Kerja Praktik' });
  if (value.endDate < value.startDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'Tanggal selesai tidak boleh sebelum tanggal mulai' });
});

function mapError(error: unknown, response: Parameters<RequestHandler>[1]): boolean {
  const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: string }).code : undefined;
  if (code === 'PARTICIPANT_EMAIL_EXISTS') { response.status(409).json({ code, message: 'Email peserta sudah digunakan' }); return true; }
  return false;
}

export const staffParticipantsController: RequestHandler = async (request, response, next) => {
  try {
    const rows = await listStaffParticipants(request.session.userId!);
    response.json({ participants: rows });
  } catch (error) { next(error); }
};

export const staffParticipantDetailController: RequestHandler = async (request, response, next) => {
  try {
    const id = idSchema.safeParse(request.params.id);
    if (!id.success) { response.status(400).json({ code: 'INVALID_PARTICIPANT_ID', message: 'ID penempatan tidak valid' }); return; }
    const participant = await findStaffParticipant(request.session.userId!, id.data);
    if (!participant) { response.status(404).json({ code: 'PARTICIPANT_NOT_FOUND', message: 'Peserta tidak ditemukan' }); return; }
    response.json({ participant });
  } catch (error) { next(error); }
};

export const staffParticipantCreateController: RequestHandler = async (request, response, next) => {
  try {
    const input = participantSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ code: 'INVALID_PARTICIPANT_INPUT', message: 'Data peserta tidak valid', details: input.error.flatten().fieldErrors }); return; }
    const participant = await createStaffParticipant(request.session.userId!, input.data);
    response.status(201).json({ participant, account: { username: participant?.user_name } });
  } catch (error) { if (!mapError(error, response)) next(error); }
};

export const staffParticipantUpdateController: RequestHandler = async (request, response, next) => {
  try {
    const id = idSchema.safeParse(request.params.id);
    const input = participantSchema.safeParse(request.body);
    if (!id.success) { response.status(400).json({ code: 'INVALID_PARTICIPANT_ID', message: 'ID penempatan tidak valid' }); return; }
    if (!input.success) { response.status(400).json({ code: 'INVALID_PARTICIPANT_INPUT', message: 'Data peserta tidak valid', details: input.error.flatten().fieldErrors }); return; }
    const participant = await updateStaffParticipant(request.session.userId!, id.data, input.data);
    if (!participant) { response.status(404).json({ code: 'PARTICIPANT_NOT_FOUND', message: 'Peserta tidak ditemukan' }); return; }
    response.json({ participant });
  } catch (error) { if (!mapError(error, response)) next(error); }
};

export const staffParticipantDeleteController: RequestHandler = async (request, response, next) => {
  try {
    const id = idSchema.safeParse(request.params.id);
    if (!id.success) { response.status(400).json({ code: 'INVALID_PARTICIPANT_ID', message: 'ID penempatan tidak valid' }); return; }
    if (!await removeStaffParticipant(request.session.userId!, id.data)) { response.status(404).json({ code: 'PARTICIPANT_NOT_FOUND', message: 'Peserta tidak ditemukan' }); return; }
    response.status(204).send();
  } catch (error) { next(error); }
};

