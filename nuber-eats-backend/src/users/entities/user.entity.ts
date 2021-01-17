import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";

import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { compare, hash } from "bcrypt";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";

enum UserRole {
  Client,
  Owner,
  Delivery,
}

// graphql 전용 enum type
registerEnumType(UserRole, { name: 'UserRole' })

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(type => String)
  email: string;

  @Column({ select: false })
  @Field(type => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole; // ( "user" | "owner" | "delivery" )

  @Column({ default: false })
  @Field(type => Boolean)
  @IsBoolean()
  verified: boolean;
  
  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.owner,
  )
  restaurants: Restaurant[];


  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await compare(aPassword, this.password)
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}