import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  @Query(returns => [Restaurant] /* graphQl 표기 */) // === (returns => boolean)
  isPizzaGood(
    @Args('veganOnly') veganOnly: boolean,
  ): Restaurant[] /* typescript 표기*/ {
    return [];
  }

  @Mutation(returns => Boolean)
  createRestaurant(
    // @Args('createRestaurantInput') createRestaurantInput: createRestaurantDto,
    @Args() createRestaurantDto: CreateRestaurantDto,
  ): boolean {
    return true;
  }
}
