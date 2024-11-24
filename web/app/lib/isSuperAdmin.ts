export const isSuperAdmin = (superAdminEmailList: string, userEmail: string) => {
    return superAdminEmailList.includes(userEmail);
};