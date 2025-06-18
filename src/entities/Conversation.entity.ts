import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Entity,
} from "typeorm";

import { User, Message } from ".";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @ManyToOne(() => User, { eager: true })
  participantOne!: User;

  @ManyToOne(() => User, { eager: true })
  participantTwo!: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  @Column({ nullable: true })
  lastMessagePreview?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
