import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  @Query(returns => Restaurant) // === (returns => boolean)
  isPizzaGood() {
    return true;
  }
}
