import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

type Section = 'groups' | 'tasks' | 'homework' | 'theory' | 'profile';

interface Group {
  id: number;
  title: string;
  created_at: string;
  student_count?: number;
}

interface Task {
  id: number;
  title: string;
  text: string;
  topic: string;
  difficulty: number;
  type: string;
  ege_number?: number;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('groups');
  const [userName, setUserName] = useState('Учитель');
  const [loading, setLoading] = useState(false);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    text: '',
    topic: '',
    difficulty: 1,
    type: 'text',
    ege_number: 1
  });
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!token || role !== 'teacher') {
      navigate('/login');
      return;
    }
    
    if (name) {
      setUserName(name);
    }
    
    loadGroups(token);
    loadTasks(token);
  }, [navigate]);
  
  const loadGroups = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/692cc077-60b5-4741-bf4f-fe78a35f70d1', {
        method: 'GET',
        headers: { 'X-Auth-Token': token },
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadTasks = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6e0c117b-0720-4ea4-a9c2-159ff21108e3', {
        method: 'GET',
        headers: { 'X-Auth-Token': token },
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateGroup = async () => {
    if (!newGroupTitle.trim()) return;
    
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/b29b8b2a-e014-40b1-a374-185ba7cc74ae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ title: newGroupTitle }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setGroups([result.group, ...groups]);
        setNewGroupTitle('');
        setShowGroupForm(false);
      }
    } catch (error) {
      console.error('Ошибка создания группы:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.text.trim()) {
      alert('Заполните название и условие задачи');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/37e91b25-accb-4799-b1b9-89d5690598db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          title: newTask.title,
          text: newTask.text,
          topic: newTask.topic,
          difficulty: newTask.difficulty,
          type: newTask.type,
          ege_number: newTask.ege_number,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setTasks([result.task, ...tasks]);
        setNewTask({ title: '', text: '', topic: '', difficulty: 1, type: 'text', ege_number: 1 });
        setShowTaskForm(false);
      } else {
        alert(result.error || 'Ошибка создания задачи');
      }
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'groups' as Section, label: 'Группы', icon: 'Users' },
    { id: 'tasks' as Section, label: 'Банк задач', icon: 'BookOpen' },
    { id: 'homework' as Section, label: 'Домашние задания', icon: 'ClipboardList' },
    { id: 'theory' as Section, label: 'Теория', icon: 'BookMarked' },
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
                <p className="text-sm text-muted-foreground">Учитель</p>
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
                У вас {groups.length} групп и {tasks.length} задач в банке
              </p>
            </div>

            {activeSection === 'groups' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Мои группы</h2>
                  <Button onClick={() => setShowGroupForm(!showGroupForm)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать группу
                  </Button>
                </div>

                {showGroupForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Новая группа</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupTitle">Название группы</Label>
                        <Input
                          id="groupTitle"
                          placeholder="Например: 11-А класс"
                          value={newGroupTitle}
                          onChange={(e) => setNewGroupTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateGroup} disabled={loading}>
                          {loading ? 'Создание...' : 'Создать'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowGroupForm(false)}>
                          Отмена
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {loading && groups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Загрузка групп...</div>
                ) : groups.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Нет созданных групп. Создайте первую группу!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {groups.map((group) => (
                      <Card key={group.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{group.title}</CardTitle>
                              <CardDescription className="mt-1">
                                Создана: {new Date(group.created_at).toLocaleDateString('ru-RU')}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">{group.student_count || 0} студентов</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Icon name="Users" size={14} className="mr-1" />
                              Студенты
                            </Button>
                            <Button size="sm" variant="outline">
                              <Icon name="Send" size={14} className="mr-1" />
                              Назначить ДЗ
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'tasks' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Банк задач</h2>
                  <Button onClick={() => setShowTaskForm(!showTaskForm)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Новая задача
                  </Button>
                </div>

                {showTaskForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Новая задача</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="taskTitle">Название задачи</Label>
                        <Input
                          id="taskTitle"
                          placeholder="Например: Задача на проценты"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="taskText">Условие задачи</Label>
                        <Textarea
                          id="taskText"
                          placeholder="Введите условие задачи..."
                          value={newTask.text}
                          onChange={(e) => setNewTask({...newTask, text: e.target.value})}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="taskTopic">Тема</Label>
                          <Input
                            id="taskTopic"
                            placeholder="Например: Проценты"
                            value={newTask.topic}
                            onChange={(e) => setNewTask({...newTask, topic: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="egeNumber">Номер ЕГЭ</Label>
                          <Select 
                            value={newTask.ege_number.toString()} 
                            onValueChange={(val) => setNewTask({...newTask, ege_number: parseInt(val)})}
                          >
                            <SelectTrigger id="egeNumber">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 27}, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  Задание {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Сложность (1-10)</Label>
                          <Input
                            id="difficulty"
                            type="number"
                            min="1"
                            max="10"
                            value={newTask.difficulty}
                            onChange={(e) => setNewTask({...newTask, difficulty: parseInt(e.target.value) || 1})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taskType">Тип задачи</Label>
                          <Select 
                            value={newTask.type} 
                            onValueChange={(val) => setNewTask({...newTask, type: val})}
                          >
                            <SelectTrigger id="taskType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Текстовый ответ</SelectItem>
                              <SelectItem value="file">Файл</SelectItem>
                              <SelectItem value="code">Код</SelectItem>
                              <SelectItem value="paint">Рисунок</SelectItem>
                              <SelectItem value="table">Таблица</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleCreateTask} disabled={loading}>
                          {loading ? 'Создание...' : 'Создать задачу'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                          Отмена
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tasks.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Нет задач в банке. Создайте первую задачу!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {tasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg">{task.title}</CardTitle>
                                {task.ege_number && (
                                  <Badge variant="secondary">ЕГЭ №{task.ege_number}</Badge>
                                )}
                              </div>
                              <CardDescription className="mt-2 line-clamp-2">
                                {task.text}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">
                              Сложность: {task.difficulty}/10
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Тема: {task.topic || 'Не указана'}</span>
                            <span>•</span>
                            <span>Тип: {task.type}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'homework' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold">Домашние задания</h2>
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Раздел в разработке
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'theory' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold">Теория</h2>
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Раздел в разработке
                  </CardContent>
                </Card>
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
                      <p className="text-muted-foreground mt-1">{userName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Роль</label>
                      <p className="text-muted-foreground mt-1">Учитель</p>
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

export default TeacherDashboard;