import { ArgsType, Field, InputType } from '@nestjs/graphql';

// @InputType()
@ArgsType() // : 밑의 field를 분리된 argument로써 정의할 수 있게 해준다.
export class CreateRestaurantDto {
  @Field(type => String)
  name: string;
  @Field(type => Boolean)
  isVegan: boolean;
  @Field(type => String)
  address: string;
  @Field(type => String)
  ownerName: string;
}
