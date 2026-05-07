# Mossland BLE 기반 출퇴근 시스템

ESP32와 BLE 비콘 카드를 활용한 자동 출퇴근 관리 시스템의 관리자 대시보드.
React + TypeScript 프론트엔드 (현재 단계)

## 프로젝트 배경

- 회사 내부 출퇴근 자동화 시스템
- 프론트엔드 학습 목적 토이 프로젝트로 진행
- ESP32와 백엔드는 다음 단계에서 구현 예정

## 주요 기능

- 로그인 (현재는 임시 통과, 추후 JWT 토큰 기반으로 개발 예정)
- 대시보드: 출근 현황 카드 / 실시간 감지 피드(5초 폴링) / ESP32 디바이스 상태
- 출퇴근 기록 관리: 날짜 필터, 근무중/자동/수동 퇴근 구분
- 직원 관리: 재직중/비활성 필터
- 비콘 관리: 등록/비활성화 (모달 기반 CRUD)
- 시스템 설정: 5개 항목 부분 저장, RSSI 임계값 슬라이더 (ESP32 디바이스 관리는 실제 ESP32 연결 후 추가 예정)
- 통계 탭: 추후 추가 예정

## 기술 스택

**프론트엔드**: React 19, TypeScript, Vite
**상태/데이터**: 자체 useFetch/usePolling 훅, Context API (Auth)
**HTTP**: axios
**Mock 백엔드**: MSW (Mock Service Worker)
**스타일**: CSS Modules
**도구**: ESLint, Prettier

## 의도적 설계 결정

**Mock-first 개발**:
백엔드 없이 시작해서 타입 계약과 UI를 먼저 확정, 이후 baseURL 교체로 실제 API로 전환

**자체 데이터 페칭 훅**:
TanStack Query 같은 라이브러리 대신 useFetch/usePolling을 직접 작성
비동기 상태 관리에 대해 커스텀 훅으로 이해한 후 라이브러리로 마이그레이션 예정

**메타데이터 기반 UI**:
시스템 설정 페이지는 CONFIG_FIELDS 배열로 필드 정의를 분리
새 설정 추가 시 컴포넌트 수정 없이 메타데이터만 추가

## 다음 단계

**다음 단계 (백엔드 구축)**:

- ESP32 펌웨어 작성 (Arduino C++)
- Node.js + Express 백엔드 + PostgreSQL
- JWT 인증 통합
- mock에서 실제 API로 전환

**프론트엔드 리팩토링 예정**:

- TanStack Query 라이브러리 도입 (캐싱, 자동 refetch)
- 공통 상태 UI 컴포넌트 추출 (Loading/Empty/Error)
- 테스트 코드 추가 (Vitest + RTL)

## 실행 방법

```bash
npm install
npm run dev
```

## 학습 회고

- 프로젝트를 진행하면서 파편화된 지식을 정리하기 위해 다시 한번씩 코드를 살펴봐야할 필요성을 느낌
- 컴포넌트와 모듈을 통해 효율적으로 코드를 재사용할 수 있는 리액트 기반 프론트엔드의 구조를 이해
- AI 활용 원칙: 의사코드 먼저 작성 → AI 코드 → 한 줄씩 이해 후 적용
- "직접 만들어보고 라이브러리로 대체"하는 학습 패턴
- 다음에 같은 프로젝트를 만든다면 처음부터 TanStack Query 도입 고려
