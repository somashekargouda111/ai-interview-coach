import type { Resume } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { extractResumeSkills } from '../../ai';
import { storage } from '../../storage';
import { notFound } from '../../utils/AppError';

export const toResumeDto = (r: Resume, withText = false) => ({
  id: r.id,
  fileName: r.fileName,
  skills: r.skills,
  isActive: r.isActive,
  createdAt: r.createdAt,
  preview: r.extractedText.slice(0, 200),
  ...(withText ? { extractedText: r.extractedText } : {}),
});

export async function createResume(i: { userId: string; text: string; fileName?: string; fileUrl?: string }) {
  // Saving a resume must never fail because the AI is down.
  const skills = await extractResumeSkills(i.text).catch((e) => {
    console.warn('Skill extraction failed:', e?.message);
    return [] as string[];
  });
  const resume = await prisma.$transaction(async (tx) => {
    await tx.resume.updateMany({ where: { userId: i.userId, isActive: true }, data: { isActive: false } });
    return tx.resume.create({
      data: { userId: i.userId, fileName: i.fileName, fileUrl: i.fileUrl, extractedText: i.text, skills, isActive: true },
    });
  });
  return toResumeDto(resume);
}

export async function listResumes(userId: string) {
  const rows = await prisma.resume.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return rows.map((r) => toResumeDto(r));
}

export async function getResume(userId: string, id: string) {
  const r = await prisma.resume.findFirst({ where: { id, userId } });
  if (!r) throw notFound('Resume');
  return toResumeDto(r, true);
}

export async function activateResume(userId: string, id: string) {
  const r = await prisma.resume.findFirst({ where: { id, userId } });
  if (!r) throw notFound('Resume');
  await prisma.$transaction([
    prisma.resume.updateMany({ where: { userId, isActive: true }, data: { isActive: false } }),
    prisma.resume.update({ where: { id }, data: { isActive: true } }),
  ]);
  return toResumeDto({ ...r, isActive: true });
}

export async function deleteResume(userId: string, id: string) {
  const r = await prisma.resume.findFirst({ where: { id, userId } });
  if (!r) throw notFound('Resume');
  await prisma.resume.delete({ where: { id } });
  if (r.fileUrl) await storage.remove(r.fileUrl).catch(() => undefined);
}
