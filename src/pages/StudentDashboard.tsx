import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type Section = 'homework' | 'history' | 'debts' | 'profile';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState<Section>('homework');

  const menuItems = [
    { id: 'homework' as Section, label: 'Мои ДЗ', icon: 'BookOpen' },
    { id: 'history' as Section, label: 'История', icon: 'Clock' },
    { id: 'debts' as Section, label: 'Долги', icon: 'AlertCircle' },
    { id: 'profile' as Section, label: 'Профиль', icon: 'User' },
  ];

  const homeworkTasks = [
    { id: 1, title: 'Решить задачи по алгебре', subject: 'Математика', deadline: '20 ноября', status: 'active' },
    { id: 2, title: 'Написать эссе про экологию', subject: 'Русский язык', deadline: '22 ноября', status: 'active' },
    { id: 3, title: 'Лабораторная работа №5', subject: 'Физика', deadline: '25 ноября', status: 'active' },
  ];

  const debtTasks = [
    { id: 1, title: 'Контрольная работа по истории', subject: 'История', deadline: '15 ноября', overdue: 2 },
    { id: 2, title: 'Реферат по биологии', subject: 'Биология', deadline: '10 ноября', overdue: 7 },
  ];

  const historyTasks = [
    { id: 1, title: 'Тест по английскому языку', subject: 'Английский', completed: '15 ноября', score: 85 },
    { id: 2, title: 'Домашнее задание по химии', subject: 'Химия', completed: '12 ноября', score: 92 },
    { id: 3, title: 'Презентация по географии', subject: 'География', completed: '8 ноября', score: 78 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-r p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="GraduationCap" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Иван Иванов</h2>
                <p className="text-sm text-muted-foreground">Студент</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted transition-all">
              <Icon name="LogOut" size={20} />
              Выйти
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Добро пожаловать, Иван! 👋</h1>
              <p className="text-muted-foreground">
                У вас {homeworkTasks.length} активных заданий и {debtTasks.length} долга
              </p>
            </div>

            {activeSection === 'homework' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Мои домашние задания</h2>
                  <Badge variant="secondary" className="text-sm">
                    {homeworkTasks.length} заданий
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {homeworkTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription className="mt-1">{task.subject}</CardDescription>
                          </div>
                          <Badge variant="outline">{task.deadline}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm">Приступить к выполнению</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'debts' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Долги</h2>
                  <Badge variant="destructive" className="text-sm">
                    {debtTasks.length} долгов
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {debtTasks.map((task) => (
                    <Card key={task.id} className="border-destructive/50 hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {task.title}
                              <Icon name="AlertCircle" size={18} className="text-destructive" />
                            </CardTitle>
                            <CardDescription className="mt-1">{task.subject}</CardDescription>
                          </div>
                          <Badge variant="destructive">Просрочено на {task.overdue} дн.</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="destructive" size="sm">Сдать срочно</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">История выполненных заданий</h2>
                  <Badge variant="secondary" className="text-sm">
                    {historyTasks.length} заданий
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {historyTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription className="mt-1">{task.subject}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-semibold text-primary">{task.score}</div>
                            <div className="text-xs text-muted-foreground">баллов</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="CheckCircle" size={16} className="text-green-500" />
                          Сдано {task.completed}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold">Настройки профиля</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Личная информация</CardTitle>
                    <CardDescription>Управляйте своими данными</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Имя</label>
                      <p className="text-muted-foreground mt-1">Иван Иванов</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-muted-foreground mt-1">ivan@example.com</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Роль</label>
                      <p className="text-muted-foreground mt-1">Студент</p>
                    </div>
                    <Button variant="outline" className="mt-4">Редактировать профиль</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
