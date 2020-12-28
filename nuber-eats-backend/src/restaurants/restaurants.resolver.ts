import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantResolver {
  @Query(() => Boolean) // === (returns => boolean)
  isPizzaGood(): boolean {
    return true;
  }
}
