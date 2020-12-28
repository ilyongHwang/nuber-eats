import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(is => String) // === @Field(() => String)
  name: string;

  @Field(type => Boolean, { nullable: true })
  isGood?: boolean;
}
