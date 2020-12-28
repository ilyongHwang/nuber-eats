import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  @Query(returns => [Restaurant] /* graphQl 표기 */) // === (returns => boolean)
  isPizzaGood(
    @Args('veganOnly') veganOnly: boolean,
  ): Restaurant[] /* typescript 표기*/ {
    return [];
  }
}
