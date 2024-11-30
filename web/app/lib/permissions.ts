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

const access = createAccessControl(statement);

export const admin = access.newRole({
  ...adminAc.statements,
  customer: ["create", "read", "update", "delete"],
});

export const owner = access.newRole({
  ...ownerAc.statements,
  customer: ["read"],
});

export const member = access.newRole({
  ...memberAc.statements,
  customer: ["read"],
});
