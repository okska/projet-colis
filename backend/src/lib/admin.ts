type BasicUser = {
  email?: string | null
}

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminUser(user: BasicUser | null | undefined): boolean {
  if (!user?.email) {
    return false
  }

  return adminEmails.includes(user.email.toLowerCase())
}
