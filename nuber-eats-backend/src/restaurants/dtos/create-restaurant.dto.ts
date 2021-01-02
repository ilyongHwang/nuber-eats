import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

// @InputType()
// @ArgsType() // : 밑의 field를 분리된 argument로써 정의할 수 있게 해준다.
@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id'] /*, InputType*/) { }