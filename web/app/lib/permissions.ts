import {
  createAccessControl,
  defaultStatements,
  adminAc,
  ownerAc,
  memberAc,
} from "better-auth/plugins/access";

const statement = {
  ...defaultStatements,
  customer: ["create", "read", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statement);

export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  customer: ["create", "read", "update", "delete"],
});

export const ownerRole = accessControl.newRole({
  ...ownerAc.statements,
});

export const memberRole = accessControl.newRole({
  ...memberAc.statements,
  customer: ["read"],
});

export type OrgRoles = "admin" | "member";
