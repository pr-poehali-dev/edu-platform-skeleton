import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Section = 'groups' | 'tasks' | 'homework' | 'theory' | 'profile' | 'statistics';

interface MenuItem {
  id: Section;
  label: string;
  icon: string;
}

interface TeacherSidebarProps {
  userName: string;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const TeacherSidebar = ({ userName, activeSection, onSectionChange }: TeacherSidebarProps) => {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { id: 'groups' as Section, label: 'Группы', icon: 'Users' },
    { id: 'tasks' as Section, label: 'Банк задач', icon: 'BookOpen' },
    { id: 'homework' as Section, label: 'Домашние задания', icon: 'ClipboardList' },
    { id: 'theory' as Section, label: 'Теория', icon: 'BookMarked' },
    { id: 'statistics' as Section, label: 'Статистика', icon: 'BarChart' },
    { id: 'profile' as Section, label: 'Профиль', icon: 'User' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
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
            onClick={() => onSectionChange(item.id)}
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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted transition-all"
        >
          <Icon name="LogOut" size={20} />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
