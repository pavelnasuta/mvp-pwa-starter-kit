export type RouteName = 'home' | 'ideas' | 'gallery'

export type AppRoute = {
  name: RouteName
  label: string
}

export const appRoutes: AppRoute[] = [
  { name: 'home', label: 'Главная' },
  { name: 'ideas', label: 'Идеи' },
  { name: 'gallery', label: 'Галерея' },
]
