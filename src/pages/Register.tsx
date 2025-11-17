import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Введите имя');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/e560f950-efc0-499d-ade5-a7c0b2469ced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: name,
          email: email,
          password: password,
          role: role,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Ошибка регистрации');
        return;
      }
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/20 px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Icon name="GraduationCap" size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Регистрация</h1>
          <p className="text-muted-foreground">Создайте новый аккаунт</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Повторите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Роль</Label>
              <RadioGroup value={role} onValueChange={setRole} className="space-y-3">
                <div className="flex items-center space-x-3 border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Icon name="BookOpen" size={20} className="text-primary" />
                    <div>
                      <div className="font-medium">Студент</div>
                      <div className="text-xs text-muted-foreground">Я хочу учиться</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Icon name="School" size={20} className="text-primary" />
                    <div>
                      <div className="font-medium">Учитель</div>
                      <div className="text-xs text-muted-foreground">Я хочу преподавать</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
                Аккаунт создан! Перенаправляем на страницу входа...
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={loading || success}
            >
              {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline transition-all">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;