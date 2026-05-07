# Moss Attendance API

Express, TypeScript, Prisma, PostgreSQL 기반 백엔드 보일러플레이트입니다.

## 설치된 주요 패키지

- `express`: HTTP API 서버
- `prisma`: Prisma CLI
- `@prisma/client`: Prisma Client 런타임
- `@prisma/adapter-pg`: Prisma 7 PostgreSQL driver adapter
- `pg`: PostgreSQL driver
- `cors`: 프론트엔드 CORS 허용
- `helmet`: 기본 보안 헤더
- `dotenv`: 환경변수 로드
- `tsx`: TypeScript 개발 서버 실행

## 환경변수

`.env.example`을 복사해서 `backend/.env`를 만드세요.

```bash
copy .env.example .env
```

`DATABASE_URL`은 멘토님이 준 PostgreSQL 접속 정보로 채우면 됩니다.

```env
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME?sslmode=require
```

## 실행

```bash
npm install
npm run prisma:generate
npm run dev
```

서버 기본 주소:

```txt
http://localhost:4000
```

## 확인용 API

```txt
GET /api/v1/health
GET /api/v1/health/db
```

`/api/v1/health/db`는 실제 PostgreSQL 연결을 확인합니다.

## Prisma 명령

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:push
```

처음에는 기존 DB 상태를 망가뜨리지 않도록 `migrate` 전에 멘토님과 테이블 생성 권한/운영 DB 여부를 확인하세요.
