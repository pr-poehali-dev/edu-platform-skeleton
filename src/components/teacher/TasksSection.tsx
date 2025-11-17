import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface TasksSectionProps {
  tasks: Task[];
  loading: boolean;
  showTaskForm: boolean;
  newTask: {
    title: string;
    text: string;
    topic: string;
    difficulty: number;
    type: string;
    ege_number: number;
  };
  setShowTaskForm: (show: boolean) => void;
  setNewTask: (task: any) => void;
  handleCreateTask: () => void;
}

const TasksSection = ({
  tasks,
  loading,
  showTaskForm,
  newTask,
  setShowTaskForm,
  setNewTask,
  handleCreateTask,
}: TasksSectionProps) => {
  return (
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
  );
};

export default TasksSection;
