import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Theory {
  id: number;
  title: string;
  content: string;
  ege_number: number;
  file_url?: string;
  created_at: string;
}

interface TheorySectionProps {
  theory: Theory[];
  loading: boolean;
  handleCreateTheory: (data: {title: string; content: string; ege_number: number; file_url?: string}) => void;
}

const TheorySection = ({
  theory,
  loading,
  handleCreateTheory,
}: TheorySectionProps) => {
  const [showTheoryForm, setShowTheoryForm] = useState(false);
  const [newTheory, setNewTheory] = useState({
    title: '',
    content: '',
    ege_number: 1,
    file_url: ''
  });

  const handleSubmit = () => {
    handleCreateTheory(newTheory);
    setNewTheory({ title: '', content: '', ege_number: 1, file_url: '' });
    setShowTheoryForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Теория</h2>
        <Button onClick={() => setShowTheoryForm(!showTheoryForm)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить материал
        </Button>
      </div>

      {showTheoryForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новый теоретический материал</CardTitle>
            <CardDescription>Добавьте теорию для подготовки к ЕГЭ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theoryTitle">Название</Label>
              <Input
                id="theoryTitle"
                placeholder="Например: Проценты - базовые понятия"
                value={newTheory.title}
                onChange={(e) => setNewTheory({...newTheory, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theoryEge">Номер ЕГЭ</Label>
              <Select 
                value={newTheory.ege_number.toString()} 
                onValueChange={(val) => setNewTheory({...newTheory, ege_number: parseInt(val)})}
              >
                <SelectTrigger id="theoryEge">
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
              <Label htmlFor="theoryContent">Содержание</Label>
              <Textarea
                id="theoryContent"
                placeholder="Введите текст теории (поддерживается Markdown)"
                value={newTheory.content}
                onChange={(e) => setNewTheory({...newTheory, content: e.target.value})}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theoryFile">Ссылка на файл (необязательно)</Label>
              <Input
                id="theoryFile"
                placeholder="https://example.com/file.pdf"
                value={newTheory.file_url}
                onChange={(e) => setNewTheory({...newTheory, file_url: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                PDF, Word или MD файл с дополнительными материалами
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={loading || !newTheory.title.trim() || !newTheory.content.trim()}
              >
                {loading ? 'Создание...' : 'Добавить'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTheoryForm(false);
                  setNewTheory({title: '', content: '', ege_number: 1, file_url: ''});
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {theory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Нет теоретических материалов. Добавьте первый!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {theory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant="secondary">ЕГЭ №{item.ege_number}</Badge>
                    </div>
                    <CardDescription className="mt-2 line-clamp-2">
                      {item.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {item.file_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                        <Icon name="FileText" size={14} className="mr-1" />
                        Открыть файл
                      </a>
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Добавлено: {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheorySection;
