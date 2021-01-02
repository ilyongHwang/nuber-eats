import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) { }

  @Query(returns => [Restaurant] /* graphQl 표기 */) // === (returns => boolean)
  restaurants(): Promise<Restaurant[]> /* typescript 표기*/ {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  createRestaurant(
    // @Args('createRestaurantInput') createRestaurantInput: createRestaurantDto,
    @Args() createRestaurantDto: CreateRestaurantDto,
  ): boolean {
    return true;
  }
}
