import { BarChart3, CheckCircle2, CircleAlert, MoreHorizontal, Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Textarea } from '../../components/ui/textarea'

const chartData = [
  { name: 'Пн', value: 4 },
  { name: 'Вт', value: 7 },
  { name: 'Ср', value: 5 },
  { name: 'Чт', value: 9 },
  { name: 'Пт', value: 6 },
]

export function GalleryPage() {
  return (
    <section className="space-y-6" aria-labelledby="gallery-title">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Основа интерфейса</p>
        <h1 id="gallery-title" className="text-3xl font-bold tracking-tight">Галерея компонентов</h1>
        <p className="max-w-2xl text-muted-foreground">Копируемые, доступные паттерны для будущих экранов продукта.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Статусы</CardTitle>
            <CardDescription>Короткие сообщения о состоянии записи.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge><CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Готово</Badge>
            <Badge variant="secondary">Черновик</Badge>
            <Badge variant="outline">Новое</Badge>
            <Badge variant="destructive"><CircleAlert className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Ошибка</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поиск и фильтр</CardTitle>
            <CardDescription>Подход для списка локальных записей.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="gallery-search">Поиск идей</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input id="gallery-search" placeholder="Например, мастерская" className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger aria-label="Статус идей"><SelectValue placeholder="Выберите статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
                <SelectItem value="done">Готовые</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Уведомления и меню без блокировки потока.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => toast.success('Изменения сохранены локально')}>Показать уведомление</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="icon" aria-label="Открыть дополнительные действия"><MoreHorizontal className="h-5 w-5" aria-hidden="true" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => toast('Действие выбрано')}>Переименовать пример</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast('Экспорт подготовлен')}>Экспортировать пример</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Форма и вкладки</CardTitle>
            <CardDescription>Компактная форма, которая не теряет иерархию на телефоне.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="idea">
              <TabsList aria-label="Тип примера"><TabsTrigger value="idea">Идея</TabsTrigger><TabsTrigger value="note">Заметка</TabsTrigger></TabsList>
              <TabsContent value="idea" className="space-y-3">
                <Label htmlFor="gallery-description">Описание</Label>
                <Textarea id="gallery-description" placeholder="Коротко опишите замысел" />
                <Dialog>
                  <DialogTrigger asChild><Button type="button">Открыть диалог</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Новая идея</DialogTitle><DialogDescription>Диалог удерживает фокус и закрывается клавишей Escape.</DialogDescription></DialogHeader>
                    <DialogFooter><Button type="button">Сохранить</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
              <TabsContent value="note"><p className="text-sm text-muted-foreground">Та же композиция подходит для краткой заметки.</p></TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />Пример метрик</CardTitle>
            <CardDescription>Небольшая диаграмма для личной панели без внешней аналитики.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56" role="img" aria-label="Столбчатая диаграмма: пять дней с количеством идей от четырёх до девяти">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="value" name="Идеи" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Загрузка и опасное действие</CardTitle>
          <CardDescription>Сначала обозначьте ожидание, затем запросите явное подтверждение.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2" role="status" aria-label="Пример загрузки"><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-32" /></div>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button type="button" variant="destructive">Удалить пример</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Удалить пример?</AlertDialogTitle><AlertDialogDescription>Это демонстрация: действие не удалит данные, пока будущий экран не подключит его к локальному хранилищу.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction>Подтвердить удаление</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </section>
  )
}
