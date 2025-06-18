import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { User, Conversation } from ".";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation!: Conversation;

  @ManyToOne(() => User, { eager: true })
  sender!: User;

  @Column("text")
  content!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: false })
  deletedForEveryone!: boolean;

  @Column({ type: "uuid", array: true, default: [] })
  deletedForUsers!: string[]; // IDs of users who deleted the message for themselves

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // used for full message deletion
}
