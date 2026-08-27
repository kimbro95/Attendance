import { atom } from 'jotai';

// 다크모드 상태
export const darkModeAtom = atom<boolean>(false);

// 인증 상태 (null = 아직 초기화 중)
export const isAuthenticatedAtom = atom<boolean | null>(null);

// 로딩 상태
export const isLoadingAtom = atom<boolean>(false);

// 에러 메시지
export const errorMessageAtom = atom<string | null>(null);
