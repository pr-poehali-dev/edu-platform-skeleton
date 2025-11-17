import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Task {
  id: number;
  title: string;
  text: string;
  topic: string;
  difficulty: number;
  type: string;
  ege_number?: number;
}

interface HomeworkSet {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  task_count: number;
}

interface HomeworkSectionProps {
  homeworkSets: HomeworkSet[];
  tasks: Task[];
  loading: boolean;
  showHomeworkForm: boolean;
  newHomework: {
    title: string;
    description: string;
    selectedTasks: number[];
  };
  setShowHomeworkForm: (show: boolean) => void;
  setNewHomework: (homework: any) => void;
  handleCreateHomework: () => void;
}

const HomeworkSection = ({
  homeworkSets,
  tasks,
  loading,
  showHomeworkForm,
  newHomework,
  setShowHomeworkForm,
  setNewHomework,
  handleCreateHomework,
}: HomeworkSectionProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Домашние задания</h2>
        <Button onClick={() => setShowHomeworkForm(!showHomeworkForm)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Создать ДЗ
        </Button>
      </div>

      {showHomeworkForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новое домашнее задание</CardTitle>
            <CardDescription>Соберите вариант из задач банка</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hwTitle">Название ДЗ</Label>
              <Input
                id="hwTitle"
                placeholder="Например: ДЗ по теме Проценты"
                value={newHomework.title}
                onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hwDesc">Описание (необязательно)</Label>
              <Textarea
                id="hwDesc"
                placeholder="Краткое описание домашнего задания"
                value={newHomework.description}
                onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Выберите задачи из банка</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет задач в банке. Сначала создайте задачи.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newHomework.selectedTasks.includes(task.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewHomework({
                              ...newHomework,
                              selectedTasks: [...newHomework.selectedTasks, task.id]
                            });
                          } else {
                            setNewHomework({
                              ...newHomework,
                              selectedTasks: newHomework.selectedTasks.filter(id => id !== task.id)
                            });
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          {task.ege_number && (
                            <Badge variant="secondary" className="text-xs">№{task.ege_number}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{task.text}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Выбрано задач: {newHomework.selectedTasks.length}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateHomework}
                disabled={loading || !newHomework.title.trim() || newHomework.selectedTasks.length === 0}
              >
                {loading ? 'Создание...' : 'Создать ДЗ'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowHomeworkForm(false);
                  setNewHomework({title: '', description: '', selectedTasks: []});
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {homeworkSets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Нет созданных домашних заданий. Создайте первое ДЗ!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeworkSets.map((hw) => (
            <Card key={hw.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{hw.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {hw.description || 'Без описания'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{hw.task_count} задач</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Icon name="Eye" size={14} className="mr-1" />
                    Просмотр
                  </Button>
                  <Button size="sm" variant="outline">
                    <Icon name="Send" size={14} className="mr-1" />
                    Назначить группе
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

export default HomeworkSection;
