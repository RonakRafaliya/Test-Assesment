import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { TaskAttachment } from './TaskAttachment';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'todo' })
  status!: 'todo' | 'in_progress' | 'done';

  @ManyToOne(() => User, (user) => user.ownedTasks, { nullable: false, eager: true })
  owner!: User;

  @ManyToMany(() => User, (user) => user.assignedTasks, { eager: true })
  @JoinTable()
  assignees!: User[];

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task, {
    cascade: true,
    eager: true,
  })
  attachments!: TaskAttachment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

