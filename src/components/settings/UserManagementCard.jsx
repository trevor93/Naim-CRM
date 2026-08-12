import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import SettingsSection from './SettingsSection'

export default function UserManagementCard({ users, onAdd, onEdit, onDelete }) {
  return (
    <SettingsSection
      testId="user-management"
      icon={Users}
      title="User Management"
      description="Manage users, roles, and permissions"
      className="sm:p-10"
    >
      <Button type="button" variant="outline" className="mb-7 bg-white" onClick={onAdd}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add User
      </Button>
      <div data-testid="settings-users-scroll" className="overflow-x-auto">
        <table data-testid="settings-users-table" className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-gray-50 text-primary">
            <tr>
              {['User', 'Role', 'Status', 'Last Login', 'Permissions', 'Actions'].map((header) => (
                <th key={header} scope="col" className="px-4 py-4 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4 font-medium text-text-primary">{user.name}</td>
                <td className="px-4 py-4"><Badge variant="primary">{user.role}</Badge></td>
                <td className="px-4 py-4"><Badge variant={user.status === 'Active' ? 'success' : 'default'}>{user.status}</Badge></td>
                <td className="px-4 py-4 text-text-secondary">{user.lastLogin}</td>
                <td className="px-4 py-4 text-text-secondary">{user.permissions}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" aria-label={`Edit ${user.name}`} onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                    </Button>
                    <Button type="button" variant="ghost" size="sm" aria-label={`Delete ${user.name}`} className="text-danger hover:text-danger" onClick={() => onDelete(user)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsSection>
  )
}
