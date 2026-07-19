// 邀请码生成和验证工具

// 邀请码前缀和长度
const INVITE_PREFIX = 'INV';
const INVITE_CODE_LENGTH = 11; // INV + 8位随机字符

// 生成邀请码（格式：INV + 8位随机字符）
export function generateInviteCode(): string {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = INVITE_PREFIX;
  for (let i = 0; i < 8; i++) {
    code += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return code;
}

// 验证邀请码格式（必须以INV开头，总长11位）
export function isValidInviteCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return code.startsWith(INVITE_PREFIX) && code.length === INVITE_CODE_LENGTH;
}

// 获取邀请码创建时间
export function getInviteCreatedAt(code: string): Date | null {
  if (!isValidInviteCode(code)) return null;
  return new Date();
}

// 检查邀请码是否已使用（每个设备只能使用一次）
export function isInviteCodeUsed(code: string): boolean {
  if (!isValidInviteCode(code)) return true; // 无效码视为已使用
  const usedInvites = JSON.parse(localStorage.getItem('todo_used_invites') || '[]');
  return usedInvites.includes(code);
}

// 标记邀请码为已使用
export function markInviteCodeAsUsed(code: string): void {
  if (!isValidInviteCode(code)) return;
  const usedInvites = JSON.parse(localStorage.getItem('todo_used_invites') || '[]');
  if (!usedInvites.includes(code)) {
    usedInvites.push(code);
    localStorage.setItem('todo_used_invites', JSON.stringify(usedInvites));
  }
}

// 获取所有已使用的邀请码列表
export function getUsedInviteCodes(): string[] {
  return JSON.parse(localStorage.getItem('todo_used_invites') || '[]');
}

// 获取邀请码使用次数
export function getInviteUsageCount(code: string): number {
  const usedInvites = getUsedInviteCodes();
  return usedInvites.filter(c => c === code).length;
}
