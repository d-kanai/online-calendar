const calendarRoot = '/calendar' as const;

const exposedRoutes = {
  root: () => calendarRoot,
} as const;

const internalRoutes = {} as const;

export const calendarRoutes = exposedRoutes;
export const calendarInternalRoutes = internalRoutes;
