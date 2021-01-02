import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 이 entity를 가상화하여 다른 곳에서도 쓸 것이라는 의미.
@InputType({ isAbstract: true }) // extends한 DTO 에서 3rd Arg로 설정하면 이 decorator는 필요없습니다.
@Entity()
@ObjectType()
export class Restaurant {
  @PrimaryGeneratedColumn('increment')
  @Field(type => Number)
  id: number;

  @Field(is => String) // === @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => Boolean)
  @Column()
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field(type => String)
  @Column()
  @IsString()
  categoryName: string;
}
