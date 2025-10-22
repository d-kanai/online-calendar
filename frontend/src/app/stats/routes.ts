const statsRoot = '/stats' as const;

const exposedRoutes = {
  root: () => statsRoot,
} as const;

const internalRoutes = {} as const;

export const statsRoutes = exposedRoutes;
export const statsInternalRoutes = internalRoutes;
