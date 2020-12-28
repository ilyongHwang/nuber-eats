import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot() // forroot: root module을 정이ㅡ
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
