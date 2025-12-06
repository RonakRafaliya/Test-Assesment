import { IsString, IsArray, IsEnum, IsUUID, MinLength, MaxLength, ArrayMinSize } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'Task title is required' })
  @MinLength(1, { message: 'Task title cannot be empty' })
  @MaxLength(200, { message: 'Task title must not exceed 200 characters' })
  title!: string;

  @IsString({ message: 'Description is required' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description!: string;

  @IsEnum(['todo', 'in_progress', 'done'], { message: 'Status is required' })
  status!: 'todo' | 'in_progress' | 'done';

  @IsArray({ message: 'Assignee IDs are required' })
  @ArrayMinSize(1, { message: 'At least one assignee ID is required' })
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  assigneeIds!: string[];
}

export class UpdateTaskDto {
  @IsString({ message: 'Task title is required' })
  @MinLength(1, { message: 'Task title cannot be empty' })
  @MaxLength(200, { message: 'Task title must not exceed 200 characters' })
  title!: string;

  @IsString({ message: 'Description is required' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description!: string;

  @IsEnum(['todo', 'in_progress', 'done'], { message: 'Status is required' })
  status!: 'todo' | 'in_progress' | 'done';

  @IsArray({ message: 'Assignee IDs are required' })
  @ArrayMinSize(1, { message: 'At least one assignee ID is required' })
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  assigneeIds!: string[];
}

