import type { RequestHandler } from 'express';
import { pool } from '../../config/database.js';

type RecapRow = {
  work_date: string;
  participant_name: string;
  institution_type: string;
  institution_name: string;
  program_type: string;
  check_in_at: string | null;
  check_out_at: string | null;
  attendance_status: 'Hadir' | 'Tidak Hadir' | 'Belum Presensi';
};

function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function jakartaDate() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()); }
function period(request: Parameters<RequestHandler>[0]) {
  const today = jakartaDate();
  const startDate = request.query.start_date ?? `${today.slice(0, 8)}01`;
  const endDate = request.query.end_date ?? today;
  return isDate(startDate) && isDate(endDate) && startDate <= endDate ? { startDate, endDate } : null;
}

async function fetchRecapRows(staffId: number, startDate: string, endDate: string) {
  const result = await pool.query<RecapRow>(
    `WITH participant_scope AS (
       SELECT DISTINCT p.user_id, p.nama_lengkap, p.jenis_institut_pendidikan::text AS institution_type,
              p.nama_institut_pendidikan AS institution_name, p.jenis_prakerin::text AS program_type
       FROM sigma_presensi.peserta p
       JOIN sigma_presensi.placements pl ON pl.participant_user_id = p.user_id
       JOIN sigma_presensi.users u ON u.id = p.user_id
       WHERE pl.staff_user_id = $1 AND pl.status = 'Aktif' AND pl.deleted_at IS NULL
         AND p.deleted_at IS NULL AND u.role = 'peserta' AND u.status = 'active' AND u.deleted_at IS NULL
     ), daily AS (
       SELECT ws.work_date, ps.nama_lengkap AS participant_name, ps.institution_type,
              ps.institution_name, ps.program_type,
              MAX(a.occurred_at_server) FILTER (WHERE a.type = 'check_in') AS check_in_at,
              MAX(a.occurred_at_server) FILTER (WHERE a.type = 'check_out') AS check_out_at,
              ar.status AS record_status
       FROM sigma_presensi.work_sessions ws
       JOIN participant_scope ps ON ps.user_id = ws.participant_user_id
       LEFT JOIN sigma_presensi.attendance_records ar ON ar.work_session_id = ws.id
       LEFT JOIN sigma_presensi.attendance a ON a.attendance_record_id = ar.id
       WHERE ws.work_date BETWEEN $2::date AND $3::date
       GROUP BY ws.work_date, ps.nama_lengkap, ps.institution_type, ps.institution_name, ps.program_type, ar.status
     )
     SELECT work_date::text, participant_name, institution_type, institution_name, program_type,
            check_in_at::text, check_out_at::text,
            CASE WHEN check_in_at IS NOT NULL THEN 'Hadir'
                 WHEN record_status = 'absent' THEN 'Tidak Hadir'
                 ELSE 'Belum Presensi' END AS attendance_status
     FROM daily ORDER BY work_date DESC, participant_name ASC`,
    [staffId, startDate, endDate],
  );
  return result.rows;
}

function summary(rows: RecapRow[]) {
  return rows.reduce((counts, row) => {
    counts.total += 1;
    if (row.attendance_status === 'Hadir') counts.present += 1;
    if (row.attendance_status === 'Tidak Hadir') counts.absent += 1;
    if (row.attendance_status === 'Belum Presensi') counts.pending += 1;
    return counts;
  }, { total: 0, present: 0, absent: 0, pending: 0 });
}

function displayTime(value: string | null) { return value ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : '-'; }
function escapeHtml(value: string) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
function pdfText(value: string) { return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)').replaceAll(/[^\x20-\x7E]/g, '?'); }

function makePdf(rows: RecapRow[], startDate: string, endDate: string) {
  const lines = ['SIGMA - Rekap Presensi Peserta', `Periode: ${startDate} s.d. ${endDate}`, '', 'Tanggal | Peserta | Institusi | Status'];
  rows.forEach((row) => lines.push(`${row.work_date} | ${row.participant_name} | ${row.institution_name} | ${row.attendance_status}`));
  const commands = ['BT', '/F1 10 Tf', '50 780 Td', ...lines.flatMap((line, index) => [index ? '0 -16 Td' : '', `(${pdfText(line)}) Tj`]), 'ET'].filter(Boolean).join(' ');
  const objects = [`<< /Type /Catalog /Pages 2 0 R >>`, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`, `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`; offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

export const staffAttendanceRecapController: RequestHandler = async (request, response, next) => {
  try {
    const selectedPeriod = period(request);
    if (!selectedPeriod) { response.status(400).json({ code: 'INVALID_RECAP_PERIOD', message: 'Periode rekap tidak valid' }); return; }
    const rows = await fetchRecapRows(Number(request.session.userId), selectedPeriod.startDate, selectedPeriod.endDate);
    response.json({ period: selectedPeriod, summary: summary(rows), records: rows });
  } catch (error) { next(error); }
};

export const staffAttendanceRecapExportController: RequestHandler = async (request, response, next) => {
  try {
    const selectedPeriod = period(request);
    const format = request.query.format;
    if (!selectedPeriod || (format !== 'excel' && format !== 'pdf')) { response.status(400).json({ code: 'INVALID_RECAP_EXPORT', message: 'Format atau periode export tidak valid' }); return; }
    const rows = await fetchRecapRows(Number(request.session.userId), selectedPeriod.startDate, selectedPeriod.endDate);
    const filename = `rekap-presensi-${selectedPeriod.startDate}-${selectedPeriod.endDate}`;
    if (format === 'pdf') { response.type('application/pdf').attachment(`${filename}.pdf`).send(makePdf(rows, selectedPeriod.startDate, selectedPeriod.endDate)); return; }
    const tableRows = rows.map((row) => `<tr><td>${escapeHtml(row.work_date)}</td><td>${escapeHtml(row.participant_name)}</td><td>${escapeHtml(row.institution_name)}</td><td>${escapeHtml(row.program_type)}</td><td>${escapeHtml(displayTime(row.check_in_at))}</td><td>${escapeHtml(displayTime(row.check_out_at))}</td><td>${escapeHtml(row.attendance_status)}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Rekap Presensi</title></head><body><h1>Rekap Presensi Peserta</h1><p>Periode: ${selectedPeriod.startDate} s.d. ${selectedPeriod.endDate}</p><table border="1"><thead><tr><th>Tanggal</th><th>Peserta</th><th>Institusi</th><th>Jenis Prakerin</th><th>Jam Masuk</th><th>Jam Pulang</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    response.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8'); response.attachment(`${filename}.xls`).send(html);
  } catch (error) { next(error); }
};
