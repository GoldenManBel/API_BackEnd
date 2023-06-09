import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PersonQueryDto {
  @ApiProperty({
    example: 'Алекс',
    description: 'first name',
    required: false,
  })
  readonly first_name?: string;

  @ApiProperty({
    example: 'Шлегель',
    description: 'last name',
    required: false,
  })
  readonly last_name?: string;

  @ApiProperty({
    example: 'filmmaker',
    description: 'film role or slug the person',
  })
  @IsNotEmpty()
  readonly film_role: string;
}
