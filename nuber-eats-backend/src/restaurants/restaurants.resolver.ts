import { Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  private static readonly logger = new Logger(RestaurantResolver.name);

  constructor(private readonly restaurantService: RestaurantService) { }

  @Query(returns => [Restaurant] /* graphQl 표기 */) // === (returns => boolean)
  restaurants(): Promise<Restaurant[]> /* typescript 표기*/ {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    // @Args('createRestaurantInput') createRestaurantInput: createRestaurantDto,
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    RestaurantResolver.logger.debug(createRestaurantDto);
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    @Args('input') updateRestaurantDto: UpdateRestaurantDto
    /*
    @Args('id') id: number,
    @Args('data') data: UpdateRestaurantDto,
    */
  ): Promise<boolean> {
    RestaurantResolver.logger.debug(updateRestaurantDto);
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
