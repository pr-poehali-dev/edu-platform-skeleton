import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Group {
  id: number;
  title: string;
}

interface HomeworkSet {
  id: number;
  title: string;
}

interface StudentStat {
  student_id: number;
  full_name: string;
  email: string;
  variant_id: number | null;
  set_id: number | null;
  homework_title: string | null;
  variant_status: string | null;
  final_score: number | null;
  total_tasks: number;
  submitted_tasks: number;
  current_score: number;
}

interface StatisticsSectionProps {
  groups: Group[];
  homeworkSets: HomeworkSet[];
  onLoadStatistics: (groupId: number, setId?: number) => Promise<StudentStat[]>;
}

const StatisticsSection = ({
  groups,
  homeworkSets,
  onLoadStatistics,
}: StatisticsSectionProps) => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [statistics, setStatistics] = useState<StudentStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      loadStats();
    }
  }, [selectedGroup, selectedSet]);

  const loadStats = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    try {
      const stats = await onLoadStatistics(selectedGroup, selectedSet || undefined);
      setStatistics(stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedStats = statistics.reduce((acc, stat) => {
    if (!acc[stat.student_id]) {
      acc[stat.student_id] = {
        ...stat,
        homeworks: []
      };
    }
    if (stat.variant_id) {
      acc[stat.student_id].homeworks.push(stat);
    }
    return acc;
  }, {} as Record<number, StudentStat & { homeworks: StudentStat[] }>);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Статистика по группам</h2>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Выберите группу и опционально ДЗ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Группа</label>
              <Select 
                value={selectedGroup?.toString() || ''} 
                onValueChange={(val) => setSelectedGroup(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ДЗ (необязательно)</label>
              <Select 
                value={selectedSet?.toString() || ''} 
                onValueChange={(val) => setSelectedSet(val ? parseInt(val) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все ДЗ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все ДЗ</SelectItem>
                  {homeworkSets.map((hw) => (
                    <SelectItem key={hw.id} value={hw.id.toString()}>
                      {hw.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Загрузка статистики...
          </CardContent>
        </Card>
      ) : !selectedGroup ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Выберите группу для просмотра статистики
          </CardContent>
        </Card>
      ) : Object.keys(groupedStats).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Нет данных по выбранной группе
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.values(groupedStats).map((student) => (
            <Card key={student.student_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{student.full_name}</CardTitle>
                    <CardDescription className="mt-1">{student.email}</CardDescription>
                  </div>
                  {student.homeworks.length > 0 && (
                    <Badge variant="outline">
                      {student.homeworks.length} ДЗ
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.homeworks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет назначенных ДЗ</p>
                ) : (
                  student.homeworks.map((hw) => (
                    <div key={hw.variant_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium">{hw.homework_title}</div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Сдано: {hw.submitted_tasks}/{hw.total_tasks}</span>
                          {hw.current_score > 0 && <span>Баллы: {hw.current_score}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hw.variant_status === 'completed' ? (
                          <Badge className="bg-green-500">Завершено</Badge>
                        ) : hw.submitted_tasks === hw.total_tasks ? (
                          <Badge className="bg-blue-500">На проверке</Badge>
                        ) : hw.submitted_tasks > 0 ? (
                          <Badge variant="secondary">В процессе</Badge>
                        ) : (
                          <Badge variant="outline">Не начато</Badge>
                        )}
                        <Button size="sm" variant="ghost">
                          <Icon name="Eye" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatisticsSection;
