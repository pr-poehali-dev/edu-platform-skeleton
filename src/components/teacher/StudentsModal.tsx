import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Group {
  id: number;
  title: string;
  created_at: string;
  student_count?: number;
}

interface Student {
  enrollment_id: number;
  student_id: number;
  full_name: string;
  email: string;
  enrolled_at: string;
}

interface StudentsModalProps {
  show: boolean;
  selectedGroup: Group | null;
  groupStudents: Student[];
  newStudentEmail: string;
  loading: boolean;
  setNewStudentEmail: (email: string) => void;
  handleAddStudent: () => void;
  onClose: () => void;
}

const StudentsModal = ({
  show,
  selectedGroup,
  groupStudents,
  newStudentEmail,
  loading,
  setNewStudentEmail,
  handleAddStudent,
  onClose,
}: StudentsModalProps) => {
  if (!show || !selectedGroup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{selectedGroup.title}</h2>
              <p className="text-muted-foreground mt-1">{groupStudents.length} студентов</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-4">
            <h3 className="font-medium">Добавить студента</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Email студента"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              />
              <Button onClick={handleAddStudent} disabled={loading}>
                {loading ? 'Добавление...' : 'Добавить'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Список студентов</h3>
            {loading && groupStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : groupStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                В группе пока нет студентов
              </div>
            ) : (
              <div className="space-y-2">
                {groupStudents.map((student) => (
                  <div key={student.enrollment_id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {new Date(student.enrolled_at).toLocaleDateString('ru-RU')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsModal;
