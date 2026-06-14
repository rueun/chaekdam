import 'server-only';
import { CaptureHighlightUseCase } from '@/lib/application/capture-highlight.use-case';
import { ListHighlightsUseCase } from '@/lib/application/list-highlights.use-case';
import { AddBookToShelfUseCase } from '@/lib/application/add-book-to-shelf.use-case';
import { ListBooksUseCase } from '@/lib/application/list-books.use-case';
import { SetBookStatusUseCase } from '@/lib/application/set-book-status.use-case';
import { RemoveBookFromShelfUseCase } from '@/lib/application/remove-book-from-shelf.use-case';
import { LogReadingSessionUseCase } from '@/lib/application/log-reading-session.use-case';
import { GetReadingLogUseCase } from '@/lib/application/get-reading-log.use-case';
import { UpdateUserProfileUseCase } from '@/lib/application/update-user-profile.use-case';
import type { AuthSession } from '@/lib/domain/ports/auth-session';
import { createSupabaseServerClient } from './supabase/server-client';
import { SupabaseHighlightRepository } from './supabase/supabase-highlight-repository';
import { SupabaseBookRepository } from './supabase/supabase-book-repository';
import { SupabaseReadingSessionRepository } from './supabase/supabase-reading-session-repository';
import { SupabaseUserProfileRepository } from './supabase/supabase-user-profile-repository';
import { SupabaseAuthSession } from './supabase/supabase-auth-session';

/**
 * 의존성 조립 — 유스케이스/포트에 Infra Adapter 를 주입하는 유일한 지점.
 * 요청 범위 Supabase 클라이언트(사용자 세션·RLS)를 어댑터에 연결한다.
 */
export async function createCaptureHighlightUseCase(): Promise<CaptureHighlightUseCase> {
  const client = await createSupabaseServerClient();
  return new CaptureHighlightUseCase(new SupabaseHighlightRepository(client));
}

export async function createListHighlightsUseCase(): Promise<ListHighlightsUseCase> {
  const client = await createSupabaseServerClient();
  return new ListHighlightsUseCase(new SupabaseHighlightRepository(client));
}

export async function createAddBookToShelfUseCase(): Promise<AddBookToShelfUseCase> {
  const client = await createSupabaseServerClient();
  return new AddBookToShelfUseCase(new SupabaseBookRepository(client));
}

export async function createListBooksUseCase(): Promise<ListBooksUseCase> {
  const client = await createSupabaseServerClient();
  return new ListBooksUseCase(new SupabaseBookRepository(client));
}

export async function createSetBookStatusUseCase(): Promise<SetBookStatusUseCase> {
  const client = await createSupabaseServerClient();
  return new SetBookStatusUseCase(new SupabaseBookRepository(client));
}

export async function createRemoveBookFromShelfUseCase(): Promise<RemoveBookFromShelfUseCase> {
  const client = await createSupabaseServerClient();
  return new RemoveBookFromShelfUseCase(new SupabaseBookRepository(client));
}

export async function createLogReadingSessionUseCase(): Promise<LogReadingSessionUseCase> {
  const client = await createSupabaseServerClient();
  return new LogReadingSessionUseCase(new SupabaseReadingSessionRepository(client));
}

export async function createGetReadingLogUseCase(): Promise<GetReadingLogUseCase> {
  const client = await createSupabaseServerClient();
  return new GetReadingLogUseCase(new SupabaseReadingSessionRepository(client));
}

export async function createUpdateUserProfileUseCase(): Promise<UpdateUserProfileUseCase> {
  const client = await createSupabaseServerClient();
  return new UpdateUserProfileUseCase(new SupabaseUserProfileRepository(client));
}

/** 현재 요청의 인증 컨텍스트(진입점 인가 게이트용). */
export async function createAuthSession(): Promise<AuthSession> {
  const client = await createSupabaseServerClient();
  return new SupabaseAuthSession(client);
}
