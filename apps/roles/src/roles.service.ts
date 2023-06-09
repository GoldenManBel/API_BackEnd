import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Repository } from 'sequelize-typescript';
import { v4 as uuid } from 'uuid';
import { Profile, Role, User, UserRole } from '@app/shared';
import { RoleInterface, UserRoleInterface } from './interface/role.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role) private roleRepository: Repository<Role>,
    @InjectModel(UserRole) private usersRolesRepository: Repository<UserRole>,
  ) {}

  private generateUUID(): string {
    return uuid();
  }

  async getRoles(): Promise<Role[]> {
    const roles = await this.roleRepository.findAll({
      include: [
        {
          model: User,
          attributes: ['user_id', 'email'],
          include: [
            {
              model: Profile,
              attributes: ['profile_id', 'first_name', 'last_name'],
            },
          ],
          through: {
            attributes: [],
          },
        },
      ],
    });

    return roles;
  }

  async getRoleByValue(value: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { value },
      include: [
        {
          model: User,
          attributes: ['user_id', 'email'],
          include: [
            {
              model: Profile,
              attributes: ['profile_id', 'first_name', 'last_name'],
            },
          ],
          through: {
            attributes: [],
          },
        },
      ],
    });

    return role;
  }

  async createRole(newRole: RoleInterface): Promise<Role> {
    const { value } = newRole;

    const checkRole = await this.getRoleByValue(value);

    if (checkRole) {
      return null;
    }

    const role = await this.roleRepository.create({
      role_id: this.generateUUID(),
      ...newRole,
    });

    return role;
  }

  async updateRole(data: {
    value: string;
    updateRole: RoleInterface;
  }): Promise<Role | string> {
    const { value } = data;

    const checkRole = await this.getRoleByValue(value);

    if (!checkRole) {
      return 'role not found';
    }

    const checkNewRole = await this.getRoleByValue(data.updateRole.value);

    if (checkNewRole) {
      return null;
    }

    await this.roleRepository.update(
      { ...data.updateRole },
      {
        where: {
          value,
        },
      },
    );

    const role = await this.getRoleByValue(data.updateRole.value);

    return role;
  }

  async deleteRole(value: string): Promise<Role> {
    const checkRole = await this.getRoleByValue(value);

    if (!checkRole) {
      return null;
    }

    await this.roleRepository.destroy({
      where: { value },
      force: true,
    });

    return checkRole;
  }

  async createUserRole(data: UserRoleInterface): Promise<string | UserRole> {
    try {
      const { user_id, role_id } = data;

      const checkUserRole = await this.usersRolesRepository.findOne({
        where: { user_id, role_id },
      });

      if (checkUserRole) {
        return null;
      }

      const newUserRole = await this.usersRolesRepository.create({
        user_role_id: this.generateUUID(),
        ...data,
      });

      return newUserRole;
    } catch (error) {
      return 'data not correct';
    }
  }

  async deleteUserRole(data: UserRoleInterface): Promise<UserRole> {
    const { user_id, role_id } = data;

    const userRole = await this.usersRolesRepository.findOne({
      where: { user_id, role_id },
    });

    await this.usersRolesRepository.destroy({
      where: { user_id, role_id },
      force: true,
    });

    return userRole;
  }
}
