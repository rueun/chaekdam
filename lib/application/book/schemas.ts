import { z } from 'zod';

/**
 * 책 담기 입력 검증 — Server Action 진입점(신뢰 경계)에서 사용.
 * coverColor 는 디자인 토큰(var(--token)) 또는 hex 만 허용해 임의 문자열 유입을 차단.
 */
export const addBookSchema = z.object({
  title: z.string().trim().min(1, '책 제목을 입력해 주세요').max(300, '책 제목이 너무 길어요'),
  author: z.string().trim().max(200, '저자명이 너무 길어요'),
  status: z.enum(['reading', 'done', 'wish', 'paused']),
  coverColor: z
    .string()
    .max(64)
    .regex(/^(var\(--[a-z0-9-]+\)|#[0-9a-fA-F]{3,8})$/, '표지 색 형식이 올바르지 않아요')
    .nullable()
    .optional(),
});

export type AddBookInput = z.infer<typeof addBookSchema>;
