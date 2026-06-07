// 'server-only' 는 react-server 조건이 없는 환경(Vitest/Node)에서 import 시 throw 한다.
// 테스트에서는 이 no-op 스텁으로 alias 해 서버 전용 모듈도 로드 가능하게 한다.
export {};
