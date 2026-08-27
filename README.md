# 📋 Attendance Manager - 출석 관리 및 통계 웹 서비스

팀 출석을 효율적으로 관리하고 통계를 시각화하는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **관리자 인증**: .env 파일의 6자리 코드로 간단하게 로그인
- **유저 관리**: 팀 멤버 추가/수정/삭제
- **일정 관리**: 미팅, 이벤트 등의 일정 생성
- **일괄 출석 체크**: 특정 일정에 대해 모든 유저의 참석/불참을 한 번에 체크
- **출석 통계**: 실시간 출석률, 참석인원, 불참인원 시각화
- **다크모드**: 라이트/다크모드 지원 및 저장

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **스타일링**: Tailwind CSS + CSS 변수 (다크모드 지원)
- **상태 관리**: Jotai (클라이언트 전역 상태)
- **데이터 Fetching**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **배포**: Vercel

## 📋 설치 및 실행

### 1. 환경 설정

#### 1.1 Supabase 설정
1. [Supabase](https://supabase.com)에서 무료 계정 생성
2. 새 프로젝트 생성
3. SQL Editor에서 다음 명령어로 테이블 생성:

```sql
-- users 테이블
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- events 테이블
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- attendance 테이블
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ATTEND', 'OPPOSE')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- RLS (Row Level Security) 정책 - 공개로 설정 (개발용)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.attendance FOR ALL USING (true);
```

4. Supabase 대시보드 → Settings → API에서 다음 정보 복사:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

#### 1.2 환경 변수 설정

`.env.local` 파일을 열고 다음 정보를 입력:

```env
# 관리자 인증 코드 (6자리 숫자)
NEXT_PUBLIC_ADMIN_CODE=123456

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 3. 로그인

로그인 페이지에서 설정한 6자리 코드(기본값: `123456`)를 입력하세요.

## 📖 사용법

### 1. 유저 추가
- 사이드바 → "유저" → "+ 새 유저" 버튼 클릭
- 이름 입력 (필수), 이메일 입력 (선택)
- "유저 추가" 버튼 클릭

### 2. 일정 생성
- 사이드바 → "일정" → "+ 새 일정" 버튼 클릭
- 제목과 날짜 입력
- "일정 생성" 버튼 클릭

### 3. 출석 일괄 체크 ⭐
1. 일정 목록에서 체크할 일정 선택
2. "출석 체크" 버튼 클릭
3. 상단의 "일괄 체크" 섹션에서:
   - 상태 선택 (참석/불참)
   - "모두 선택" 버튼으로 일괄 체크 가능
4. 또는 각 유저별로 개별 체크 가능

### 4. 통계 확인
- "대시보드"에서 실시간 출석률 및 통계 확인
- 각 일정별 상세 현황 파악

## 🎨 다크모드

헤더의 🌙 아이콘을 클릭하여 다크모드 토글 가능. 설정이 자동 저장됩니다.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── users/           # 유저 API
│   │   ├── events/          # 일정 API
│   │   └── attendance/      # 출석 API
│   ├── dashboard/           # 대시보드 페이지
│   ├── events/              # 일정 관리 페이지
│   ├── users/               # 유저 관리 페이지
│   ├── login/               # 로그인 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 메인 페이지
│   └── providers.tsx        # Jotai + React Query 초기화
├── components/
│   └── Header.tsx           # 헤더 컴포넌트
├── lib/
│   ├── auth.ts              # 인증 유틸
│   └── supabase.ts          # Supabase 클라이언트
├── store/
│   └── atoms.ts             # Jotai 원자 상태
├── styles/
│   └── globals.css          # CSS 변수 + 글로벌 스타일
└── types/
    └── index.ts             # TypeScript 타입 정의
```

## 🔐 보안 주의사항

⚠️ **.env 파일은 절대 Git에 올리지 마세요!**

`.gitignore`에 다음이 포함되어 있습니다:
- `.env`
- `.env.local`
- `.env.*.local`

## 🚀 배포 (Vercel)

1. GitHub에 코드 push
2. [Vercel](https://vercel.com)에서 프로젝트 임포트
3. 환경 변수 설정:
   - `NEXT_PUBLIC_ADMIN_CODE`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 배포 완료!

## 📝 API 엔드포인트

### 유저
- `GET /api/users` - 모든 유저 조회
- `POST /api/users` - 유저 생성
- `GET /api/users/[id]` - 특정 유저 조회
- `PATCH /api/users/[id]` - 유저 수정
- `DELETE /api/users/[id]` - 유저 삭제

### 일정
- `GET /api/events` - 모든 일정 조회
- `POST /api/events` - 일정 생성
- `GET /api/events/[id]` - 특정 일정 조회
- `PATCH /api/events/[id]` - 일정 수정
- `DELETE /api/events/[id]` - 일정 삭제

### 출석
- `GET /api/attendance` - 모든 출석 기록 조회
- `POST /api/attendance` - 출석 생성/수정
- `GET /api/attendance/stats` - 출석 통계 조회

## 📞 문제 해결

### 로그인이 안 되는 경우
- `.env.local` 파일의 `NEXT_PUBLIC_ADMIN_CODE` 값 확인
- 6자리 숫자만 입력하셨는지 확인

### Supabase 연결 오류
- Supabase URL과 API 키가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 테이블이 올바르게 생성되었는지 확인

### 스타일이 제대로 보이지 않는 경우
- 브라우저 캐시 삭제
- `npm run dev` 재실행

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🤝 기여

버그 리포트 또는 기능 제안은 GitHub Issues를 통해 주시기 바랍니다.

---

**Happy Attendance Tracking! 📊**
