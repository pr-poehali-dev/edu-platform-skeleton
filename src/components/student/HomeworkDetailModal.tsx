import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Task {
  variant_item_id: number;
  task_id: number;
  title: string;
  text: string;
  type: string;
  ege_number?: number;
  difficulty: number;
  submission: {
    id: number;
    answer_text?: string;
    answer_file_url?: string;
    answer_code?: string;
    answer_image_url?: string;
    score?: number;
    status: string;
    submitted_at?: string;
  } | null;
}

interface HomeworkDetailModalProps {
  show: boolean;
  variantId: number;
  homeworkTitle: string;
  onClose: () => void;
  onSubmit: (variantItemId: number, answer: any) => Promise<void>;
}

const HomeworkDetailModal = ({
  show,
  variantId,
  homeworkTitle,
  onClose,
  onSubmit,
}: HomeworkDetailModalProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  useEffect(() => {
    if (show && variantId) {
      loadTasks();
    }
  }, [show, variantId]);

  const loadTasks = async () => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    try {
      const response = await fetch(`https://functions.poehali.dev/5121910f-967f-44b5-a53e-a1f18d5a1d82?variant_id=${variantId}`, {
        method: 'GET',
        headers: { 'X-Auth-Token': token || '' },
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

  const handleSubmitAnswer = async (variantItemId: number) => {
    const answer = answers[variantItemId] || {};
    await onSubmit(variantItemId, answer);
    await loadTasks();
    setExpandedTask(null);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{homeworkTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {tasks.length} задач · {tasks.filter(t => t.submission).length} решено
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка задач...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Нет задач</div>
          ) : (
            tasks.map((task, index) => (
              <Card key={task.variant_item_id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Задача {index + 1}</Badge>
                        {task.ege_number && <Badge variant="secondary">ЕГЭ №{task.ege_number}</Badge>}
                        {task.submission && (
                          <Badge className="bg-green-500">Сдано</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="mt-2 whitespace-pre-wrap">{task.text}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {expandedTask === task.variant_item_id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Ответ</Label>
                        {task.type === 'code' ? (
                          <Textarea
                            placeholder="Введите код решения"
                            value={answers[task.variant_item_id]?.answer_code || ''}
                            onChange={(e) => setAnswers({
                              ...answers,
                              [task.variant_item_id]: { ...answers[task.variant_item_id], answer_code: e.target.value }
                            })}
                            rows={8}
                            className="font-mono text-sm"
                          />
                        ) : (
                          <Textarea
                            placeholder="Введите ответ"
                            value={answers[task.variant_item_id]?.answer_text || ''}
                            onChange={(e) => setAnswers({
                              ...answers,
                              [task.variant_item_id]: { ...answers[task.variant_item_id], answer_text: e.target.value }
                            })}
                            rows={4}
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Ссылка на изображение (необязательно)</Label>
                        <Input
                          placeholder="https://example.com/image.png"
                          value={answers[task.variant_item_id]?.answer_image_url || ''}
                          onChange={(e) => setAnswers({
                            ...answers,
                            [task.variant_item_id]: { ...answers[task.variant_item_id], answer_image_url: e.target.value }
                          })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleSubmitAnswer(task.variant_item_id)}>
                          Отправить
                        </Button>
                        <Button variant="outline" onClick={() => setExpandedTask(null)}>
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {task.submission ? (
                        <>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="font-medium mb-2">Ваше решение:</div>
                            {task.submission.answer_text && (
                              <div className="text-sm whitespace-pre-wrap">{task.submission.answer_text}</div>
                            )}
                            {task.submission.answer_code && (
                              <pre className="text-sm bg-black/5 p-3 rounded overflow-x-auto">
                                <code>{task.submission.answer_code}</code>
                              </pre>
                            )}
                            {task.submission.answer_image_url && (
                              <img src={task.submission.answer_image_url} alt="Решение" className="max-w-full mt-2 rounded" />
                            )}
                            {task.submission.score !== null && task.submission.score !== undefined && (
                              <div className="mt-2 font-medium">Балл: {task.submission.score}</div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setExpandedTask(task.variant_item_id)}>
                            <Icon name="Edit" size={14} className="mr-1" />
                            Изменить ответ
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setExpandedTask(task.variant_item_id)}>
                          Решить задачу
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkDetailModal;
