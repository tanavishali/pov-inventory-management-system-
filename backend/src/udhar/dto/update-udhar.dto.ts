import { PartialType } from '@nestjs/swagger';
import { CreateUdharDto } from './create-udhar.dto';

export class UpdateUdharDto extends PartialType(CreateUdharDto) {}
