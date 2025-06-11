import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  user!: User;

  @Column({ nullable: true })
  token!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
