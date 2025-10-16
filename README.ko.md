# dep-detective 🕵️

프로젝트에서 사용되지 않거나 잘못 배치된 의존성을 감지하는 TypeScript 의존성 분석 도구입니다.

## 주요 기능

- 🔍 **미사용 의존성 감지**: package.json에 선언되었지만 소스 코드에서 import하지 않는 패키지 탐지
- ⚠️ **잘못 배치된 의존성 감지**: devDependencies에 있지만 프로덕션 코드에서 사용하는 패키지 식별
- 🚀 **빠른 성능**: Bun 기반으로 높은 성능 제공
- 🎨 **깔끔한 출력**: 컬러풀한 콘솔 출력 또는 JSON 형식 지원
- 📦 **별도 설정 불필요**: 바로 사용 가능
- 🔒 **타입 안전성**: ADT 패턴을 활용한 TypeScript 기반 구현

## 설치

```bash
npm install -D dep-detective
```

또는 npx로 바로 실행:

```bash
npx dep-detective
```

## 사용법

프로젝트 루트에서 실행:

```bash
npx dep-detective
```

### 옵션

- `-t, --text`: 텍스트 형식으로 출력 (기본값)
- `-j, --json`: JSON 형식으로 출력
- `-a, --all`: devDependencies를 포함한 모든 의존성 검사
- `-h, --help`: 도움말 표시

### 사용 예제

```bash
# 텍스트 출력 (기본값)
npx dep-detective

# JSON 출력
npx dep-detective -j
npx dep-detective --json

# devDependencies 포함 모든 의존성 검사
npx dep-detective --all
npx dep-detective -a

# JSON 형식으로 모든 의존성 검사
npx dep-detective -j --all

# 도움말 표시
npx dep-detective -h
```

### 출력 예시

**텍스트 형식:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  의존성 분석 보고서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ 미사용 의존성:
  (선언되었지만 소스 코드에서 import되지 않음)

  • lodash
  • moment

⚠ 잘못 배치된 의존성:
  (devDependencies에 있지만 소스 코드에서 사용됨)

  • axios
  • zod

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  총 문제: 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**JSON 형식:**
```json
{
  "unused": ["lodash", "moment"],
  "misplaced": ["axios", "zod"],
  "totalIssues": 4
}
```

## 아키텍처

클린 아키텍처 원칙과 관심사의 분리(SoC)를 기반으로 구현:

```
src/
├── domain/          # 타입 정의 (ADT 패턴)
├── parsers/         # Package.json 및 import 파서
├── analyzers/       # 의존성 분석 로직
├── reporters/       # 출력 포맷터
└── cli/            # CLI 옵션 및 도움말
```

### 핵심 원칙

- **ADT (대수적 데이터 타입)**: 타입 안전한 도메인 모델링
- **SoC (관심사의 분리)**: 각 모듈은 단일 책임을 가짐
- **타입 단언 배제**: `as` 없이 적절한 타입 추론 사용
- **유니온 타입**: const 배열을 활용한 타입 안전성
- **함수형 패턴**: ts-pattern과 ts-belt 활용

## 기술 스택

- **Bun**: 빠른 JavaScript 런타임 및 툴킷
- **TypeScript**: 타입 안전한 개발
- **ts-pattern**: 깔끔한 제어 흐름을 위한 패턴 매칭
- **ts-belt**: 함수형 프로그래밍 유틸리티 (AsyncResult, Option 등)
- **Biome**: 빠른 린터 및 포맷터

## 개발

```bash
# 의존성 설치
bun install

# 테스트 실행
bun test

# 테스트 커버리지
bun test --coverage

# 타입 체크
bun run typecheck

# 린트
bun run lint

# 포맷팅
bun run format

# 전체 검증 (타입 체크 + 린트 + 테스트)
bun run validate
```

### 테스트

112개의 포괄적인 테스트로 100% 코드 커버리지를 달성했습니다:

```bash
# 모든 테스트 실행
bun test

# 커버리지와 함께 실행
bun test --coverage
```

테스트는 다음을 포함합니다:
- 유닛 테스트: 각 함수의 동작 검증
- 통합 테스트: 전체 워크플로우 검증
- Edge case 테스트: 경계값 및 예외 상황 처리
- 타입 테스트: Option, Result 등 ADT 타입 검증

## CI 통합

CI 파이프라인에 추가:

```yaml
- name: 의존성 검사
  run: bunx dep-guard
```

문제가 발견되면 종료 코드 1을 반환하므로 CI/CD에 적합합니다.

## 동작 원리

1. **package.json 파싱**: 선언된 모든 의존성 추출
2. **소스 코드 스캔**: TypeScript/JavaScript 파일에서 import 문 파싱
3. **의존성 분석**:
   - 선언되었지만 사용되지 않는 패키지 탐지
   - devDependencies에 있지만 프로덕션 코드에서 사용되는 패키지 탐지
4. **결과 출력**: 텍스트 또는 JSON 형식으로 보고서 생성

### 검사 범위

- **기본 모드**: `dependencies`와 `peerDependencies`만 검사
- **전체 모드 (`--all`)**: `devDependencies`를 포함한 모든 의존성 검사

### 지원하는 import 형식

- ES6 import: `import React from 'react'`
- Named import: `import { useState } from 'react'`
- Namespace import: `import * as React from 'react'`
- CommonJS require: `require('express')`
- Type import: `import type { User } from '@/types'`
- Deep imports: `import map from 'lodash/map'`
- Scoped packages: `import { pipe } from '@mobily/ts-belt'`

### 제외 패턴

다음 파일들은 자동으로 검사에서 제외됩니다:
- `node_modules/**`
- `dist/**`
- `**/*.test.*`
- `**/*.spec.*`
- `**/test/**`
- `**/tests/**`

## 라이선스

MIT

---

## 기여

이슈와 풀 리퀘스트를 환영합니다!

## 로드맵

- [ ] 설정 파일 지원 (`.depguardrc`)
- [ ] 커스텀 제외 패턴
- [ ] Monorepo 지원
- [ ] HTML 리포트 생성
- [ ] 자동 수정 기능 (unused dependencies 제거)
