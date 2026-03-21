import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Zod validation pipe for request validation
 * Usage: @UsePipes(new ZodValidationPipe(schema))
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!value || metadata.type !== 'body') {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    return result.data;
  }
}
