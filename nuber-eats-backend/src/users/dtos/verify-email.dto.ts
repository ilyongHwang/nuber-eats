import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Verification } from "../entities/verification.entity";

@ObjectType()
export class VerifyEmailOutput extends CoreEntity {

}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}