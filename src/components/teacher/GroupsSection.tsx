import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Group {
  id: number;
  title: string;
  created_at: string;
  student_count?: number;
}

interface GroupsSectionProps {
  groups: Group[];
  loading: boolean;
  showGroupForm: boolean;
  newGroupTitle: string;
  setShowGroupForm: (show: boolean) => void;
  setNewGroupTitle: (title: string) => void;
  handleCreateGroup: () => void;
  openStudentsModal: (group: Group) => void;
}

const GroupsSection = ({
  groups,
  loading,
  showGroupForm,
  newGroupTitle,
  setShowGroupForm,
  setNewGroupTitle,
  handleCreateGroup,
  openStudentsModal,
}: GroupsSectionProps) => {
  return (
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
                  <Button size="sm" variant="outline" onClick={() => openStudentsModal(group)}>
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
  );
};

export default GroupsSection;
