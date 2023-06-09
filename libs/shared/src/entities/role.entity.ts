import { User } from '@app/shared';
import {
  Model,
  Table,
  Column,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { UserRole } from './user_role.entity';

interface RoleCreationAttr {
  role_id: string;
  value: string;
  description: string;
}

@Table({ tableName: 'role', timestamps: false })
export class Role extends Model<Role, RoleCreationAttr> {
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
  })
  role_id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  value: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @BelongsToMany(() => User, () => UserRole)
  users: User[];
}
