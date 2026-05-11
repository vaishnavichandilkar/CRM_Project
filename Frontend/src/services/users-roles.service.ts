import api from "./api";

// Roles & Permissions Interfaces
export interface Permission {
  id: number;
  name: string;
  displayName: string;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  permission: Permission;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
  _count?: {
    users: number;
  };
}

// User Interfaces
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: Role;
  lastLogin?: string;
  createdAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roleId: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const usersRolesService = {
  // Roles
  getRoles: () => api.get<Role[]>("/roles").then((r) => r.data),
  
  getPermissions: () => api.get<Permission[]>("/roles/permissions").then((r) => r.data),
  
  updateRolePermissions: (roleId: number, permissionIds: number[]) => 
    api.patch<Role>(`/roles/${roleId}/permissions`, { permissionIds }).then((r) => r.data),

  // Users
  getUsers: () => api.get<User[]>("/users").then((r) => r.data),
  
  createUser: (data: CreateUserDto) => api.post<User>("/users", data).then((r) => r.data),
  
  updateUser: (id: number, data: Partial<CreateUserDto>) => 
    api.patch<User>(`/users/${id}`, data).then((r) => r.data),
    
  deleteUser: (id: number) => api.delete(`/users/${id}`),

  getResetRequests: () => 
    api.get<any[]>("/users/password-reset/requests").then((r) => r.data),

  approveResetRequest: (requestId: number) => 
    api.post("/users/password-reset/approve", { requestId }).then((r) => r.data),
};
