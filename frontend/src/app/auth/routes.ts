const authBase = '/auth' as const;

const exposedRoutes = {
  root: () => authBase,
  signin: () => `${authBase}/signin` as const,
  signup: () => `${authBase}/signup` as const,
} as const;

const internalRoutes = {} as const;

export const authRoutes = exposedRoutes;
export const authInternalRoutes = internalRoutes;
