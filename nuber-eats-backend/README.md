# Nuber Eats

The Backend of Nuber Eats Clone

## 0. Setting
1. `nest new <project>`
2. `> gitignore` -> `node`
3. `grapql`은 미니 프로젝트로 설명할 것.

## 1. GraphQL
1. Apollo Server setup
   - `$ npm i @nestjs/graphql graphql-tools graphql apollo-server-express`
   - [x] appModule: `appService`, `appController` 제거
      - appModule 은 `main.ts`로 import되는 유일한 모듈
   - db, graphql 을 추가할 거야
   -  