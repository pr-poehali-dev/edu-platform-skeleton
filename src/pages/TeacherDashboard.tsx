import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import GroupsSection from '@/components/teacher/GroupsSection';
import TasksSection from '@/components/teacher/TasksSection';
import HomeworkSection from '@/components/teacher/HomeworkSection';
import StudentsModal from '@/components/teacher/StudentsModal';
import TheorySection from '@/components/teacher/TheorySection';
import StatisticsSection from '@/components/teacher/StatisticsSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Section = 'groups' | 'tasks' | 'homework' | 'theory' | 'profile' | 'statistics';

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

interface Student {
  enrollment_id: number;
  student_id: number;
  full_name: string;
  email: string;
  enrolled_at: string;
}

interface HomeworkSet {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  task_count: number;
}

interface Theory {
  id: number;
  title: string;
  content: string;
  ege_number: number;
  file_url?: string;
  created_at: string;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('groups');
  const [userName, setUserName] = useState('Учитель');
  const [loading, setLoading] = useState(false);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [homeworkSets, setHomeworkSets] = useState<HomeworkSet[]>([]);
  const [theory, setTheory] = useState<Theory[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', email: '' });
  
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    selectedTasks: [] as number[]
  });
  
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
    loadHomework(token);
    loadTheory(token);
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
  
  const loadHomework = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6894f30c-76fa-4127-95ed-cbc3effc5a22', {
        method: 'GET',
        headers: { 'X-Auth-Token': token },
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setHomeworkSets(data.homework_sets || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки ДЗ:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadGroupStudents = async (groupId: number) => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch(`https://functions.poehali.dev/331cd11a-d7a5-4e00-87a2-ed9ecc2dc6c8?group_id=${groupId}`, {
        method: 'GET',
        headers: { 'X-Auth-Token': token || '' },
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setGroupStudents(data.students || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки студентов:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadTheory = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/58ec8de6-3f26-424a-86d8-1da7a1e05512', {
        method: 'GET',
        headers: { 'X-Auth-Token': token },
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setTheory(data.theory || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки теории:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStudentsModal = (group: Group) => {
    setSelectedGroup(group);
    setShowStudentsModal(true);
    loadGroupStudents(group.id);
  };
  
  const handleAddStudent = async () => {
    if (!newStudentEmail.trim() || !selectedGroup) return;
    
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/143efcbc-c525-4fea-b5f5-7f523334671d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          group_id: selectedGroup.id,
          student_email: newStudentEmail,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setGroupStudents([result.enrollment, ...groupStudents]);
        setNewStudentEmail('');
        const updatedGroups = groups.map(g => 
          g.id === selectedGroup.id 
            ? { ...g, student_count: (g.student_count || 0) + 1 }
            : g
        );
        setGroups(updatedGroups);
      } else {
        alert(result.error || 'Ошибка добавления студента');
      }
    } catch (error) {
      console.error('Ошибка добавления студента:', error);
      alert('Ошибка соединения с сервером');
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
  
  const handleCreateHomework = async () => {
    if (!newHomework.title.trim() || newHomework.selectedTasks.length === 0) {
      alert('Укажите название и выберите задачи');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/79c21c3b-9319-4720-bef0-1d6c4468a0e2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          title: newHomework.title,
          description: newHomework.description,
          task_ids: newHomework.selectedTasks,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setHomeworkSets([result.homework_set, ...homeworkSets]);
        setNewHomework({ title: '', description: '', selectedTasks: [] });
        setShowHomeworkForm(false);
      } else {
        alert(result.error || 'Ошибка создания ДЗ');
      }
    } catch (error) {
      console.error('Ошибка создания ДЗ:', error);
      alert('Ошибка соединения с сервером');
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

  const handleAssignToGroup = async (setId: number, groupId: number) => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/d1dc4f7c-aa1c-4694-9af8-97efa4cf35c7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ set_id: setId, group_id: groupId }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`ДЗ назначено! Создано ${result.variants_created} вариантов для студентов`);
      } else {
        alert(result.error || 'Ошибка назначения ДЗ');
      }
    } catch (error) {
      console.error('Ошибка назначения ДЗ:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheory = async (data: {title: string; content: string; ege_number: number; file_url?: string}) => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/60202541-cbf8-42bb-ae47-be41d62c7c4f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setTheory([result.theory, ...theory]);
      } else {
        alert(result.error || 'Ошибка создания теории');
      }
    } catch (error) {
      console.error('Ошибка создания теории:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/31e73e7e-dc67-4543-8f16-962cd75fe505', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify(profileData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserName(result.user.full_name);
        localStorage.setItem('userName', result.user.full_name);
        setEditingProfile(false);
        alert('Профиль обновлён');
      } else {
        alert(result.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async (groupId: number, setId?: number) => {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams({ group_id: groupId.toString() });
    if (setId) params.append('set_id', setId.toString());
    
    const response = await fetch(`https://functions.poehali.dev/87167e9c-f3b6-4278-8405-e0328adc5afa?${params}`, {
      method: 'GET',
      headers: { 'X-Auth-Token': token || '' },
    });
    
    const data = await response.json();
    if (response.ok && data.success) {
      return data.statistics || [];
    }
    return [];
  };

  const menuItems = [
    { id: 'groups' as Section, label: 'Группы', icon: 'Users' },
    { id: 'tasks' as Section, label: 'Банк задач', icon: 'BookOpen' },
    { id: 'homework' as Section, label: 'Домашние задания', icon: 'ClipboardList' },
    { id: 'theory' as Section, label: 'Теория', icon: 'BookMarked' },
    { id: 'statistics' as Section, label: 'Статистика', icon: 'BarChart' },
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
              <GroupsSection
                groups={groups}
                loading={loading}
                showGroupForm={showGroupForm}
                newGroupTitle={newGroupTitle}
                setShowGroupForm={setShowGroupForm}
                setNewGroupTitle={setNewGroupTitle}
                handleCreateGroup={handleCreateGroup}
                openStudentsModal={openStudentsModal}
              />
            )}

            {activeSection === 'tasks' && (
              <TasksSection
                tasks={tasks}
                loading={loading}
                showTaskForm={showTaskForm}
                newTask={newTask}
                setShowTaskForm={setShowTaskForm}
                setNewTask={setNewTask}
                handleCreateTask={handleCreateTask}
              />
            )}

            {activeSection === 'homework' && (
              <HomeworkSection
                homeworkSets={homeworkSets}
                tasks={tasks}
                groups={groups}
                loading={loading}
                showHomeworkForm={showHomeworkForm}
                newHomework={newHomework}
                setShowHomeworkForm={setShowHomeworkForm}
                setNewHomework={setNewHomework}
                handleCreateHomework={handleCreateHomework}
                handleAssignToGroup={handleAssignToGroup}
              />
            )}

            {activeSection === 'theory' && (
              <TheorySection
                theory={theory}
                loading={loading}
                handleCreateTheory={handleCreateTheory}
              />
            )}

            {activeSection === 'statistics' && (
              <StatisticsSection
                groups={groups}
                homeworkSets={homeworkSets}
                onLoadStatistics={loadStatistics}
              />
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
                    {editingProfile ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="profileName">Имя</Label>
                          <Input
                            id="profileName"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                            placeholder={userName}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profileEmail">Email</Label>
                          <Input
                            id="profileEmail"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateProfile} disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить'}
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setEditingProfile(false);
                            setProfileData({full_name: '', email: ''});
                          }}>
                            Отмена
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium">Имя</label>
                          <p className="text-muted-foreground mt-1">{userName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Роль</label>
                          <p className="text-muted-foreground mt-1">Учитель</p>
                        </div>
                        <Button variant="outline" className="mt-4" onClick={() => setEditingProfile(true)}>
                          Редактировать профиль
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <StudentsModal
        show={showStudentsModal}
        selectedGroup={selectedGroup}
        groupStudents={groupStudents}
        newStudentEmail={newStudentEmail}
        loading={loading}
        setNewStudentEmail={setNewStudentEmail}
        handleAddStudent={handleAddStudent}
        onClose={() => setShowStudentsModal(false)}
      />
    </div>
  );
};

export default TeacherDashboard;