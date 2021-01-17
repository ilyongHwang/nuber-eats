import { InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

// @InputType()
// @ArgsType() // : 밑의 field를 분리된 argument로써 정의할 수 있게 해준다.
@InputType()
export class CreateRestaurantInput extends OmitType(Restaurant, [
    'id',
    'category',
    'owner',
]) {}
  
@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}