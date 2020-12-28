import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true, // join(process.cwd(), 'src/schema.gql'),
    }),
    RestaurantsModule, // forroot: root module을 정이ㅡ
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
