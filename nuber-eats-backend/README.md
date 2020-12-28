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
2. our first resolver

   - graphQL은 Apollo Server를 기반으로 동작한다.
   - **정의**
     - `typeDefs` : document 혹은 너의 서버의 schema를 표현하는 것
     - `resolvers` : 쿼리를 처리하고 mutate 시키는 function
   - `code-first` vs `schema first`
     - `schema first`: GraphQL 파일을 작성할 건데, 기본적으로 얘들은 forRoot로 주어짐. 나는 이런 접근을 좋아하지 않아. 짜증남.
     - `code first` : TypeScript의 힘을 발휘 할 수 있도록 함. 널 위해 schema를 생성해준다.
   - resolvers랑 query를 만들기
     1. 일단 restaurants module 만들기
     2. 그다음 해당 폴더에 `restaurants.resolver.ts` 파일 만들기
     3. `@Resolver()` 데코레이터가 달린 RestaurantResolver 클레스 만들기
     4. `@Query(() => Boolean)`: Query에서 무엇을 return 할 것인지 알려줘야함
     5. `localhost:3000/graphql` 접속 하면 작동 확인 가능

   > prettier가 작동안되면?
   >
   > ```
   >  // settings.json
   >  "[typescript]": {
   >     "editor.defaultFormatter": "esbenp.prettier-vscode"
   >   },
   >   "[typescriptreact]": {
   >     "editor.defaultFormatter": "esbenp.prettier-vscode"
   >   },
   > ```
   >
   > 추가하면 됩니다.

3. ObjectType
   - Entity Modeling이랑 비슷하다.
4. Arguments
   - GraphQl에 Query를 줄때 Argument를 줄 수 있다. `@Args('찾을string') variable: Type`
5. Mutation
   - query를 살펴봅시다.
