import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type Section = 'homework' | 'history' | 'debts' | 'profile';

interface HomeworkItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  total_tasks: number;
  checked_tasks: number;
  avg_score?: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('homework');
  const [userName, setUserName] = useState('Студент');
  const [loading, setLoading] = useState(true);
  const [activeHomework, setActiveHomework] = useState<HomeworkItem[]>([]);
  const [debts, setDebts] = useState<HomeworkItem[]>([]);
  const [history, setHistory] = useState<HomeworkItem[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    if (name) {
      setUserName(name);
    }
    
    fetchDashboardData(token);
  }, [navigate]);
  
  const fetchDashboardData = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9d61b6c8-3cbe-4a7c-98f1-1cdb69c576b7', {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setActiveHomework(result.data.active_homework || []);
        setDebts(result.data.debts || []);
        setHistory(result.data.history || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'homework' as Section, label: 'Мои ДЗ', icon: 'BookOpen' },
    { id: 'history' as Section, label: 'История', icon: 'Clock' },
    { id: 'debts' as Section, label: 'Долги', icon: 'AlertCircle' },
    { id: 'profile' as Section, label: 'Профиль', icon: 'User' },
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
                <h2 className="font-semibold">{userName}</h2>
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
            <button 
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted transition-all"
            >
              <Icon name="LogOut" size={20} />
              Выйти
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Добро пожаловать, {userName.split(' ')[0]}! 👋</h1>
              <p className="text-muted-foreground">
                {loading ? 'Загрузка...' : `У вас ${activeHomework.length} активных заданий и ${debts.length} долга`}
              </p>
            </div>

            {activeSection === 'homework' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Мои домашние задания</h2>
                  <Badge variant="secondary" className="text-sm">
                    {activeHomework.length} заданий
                  </Badge>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Загрузка заданий...</div>
                ) : activeHomework.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Нет активных заданий
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {activeHomework.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {task.description || 'Без описания'}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">
                              {task.checked_tasks}/{task.total_tasks} задач
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Статус: {task.status === 'not_started' ? 'Не начато' : task.status === 'in_progress' ? 'В процессе' : 'Отправлено'}
                            </div>
                            <Button size="sm">Приступить к выполнению</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'debts' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Долги</h2>
                  <Badge variant="destructive" className="text-sm">
                    {debts.length} долгов
                  </Badge>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Загрузка долгов...</div>
                ) : debts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Нет долгов! Отличная работа! 🎉
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {debts.map((task) => (
                      <Card key={task.id} className="border-destructive/50 hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {task.title}
                                <Icon name="AlertCircle" size={18} className="text-destructive" />
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {task.description || 'Без описания'}
                              </CardDescription>
                            </div>
                            <Badge variant="destructive">
                              {task.avg_score ? `Оценка: ${task.avg_score}` : 'Не проверено'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Выполнено: {task.checked_tasks}/{task.total_tasks} задач
                            </div>
                            <Button variant="destructive" size="sm">Исправить</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">История выполненных заданий</h2>
                  <Badge variant="secondary" className="text-sm">
                    {history.length} заданий
                  </Badge>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Загрузка истории...</div>
                ) : history.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Пока нет выполненных заданий
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {history.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {task.description || 'Без описания'}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-semibold text-primary">
                                {task.avg_score || '—'}
                              </div>
                              <div className="text-xs text-muted-foreground">баллов</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="CheckCircle" size={16} className="text-green-500" />
                            Проверено: {task.checked_tasks}/{task.total_tasks} задач
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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