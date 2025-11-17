import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    console.log('Register:', { name, email, password, role });
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

            <Button type="submit" className="w-full h-11 text-base font-medium">
              Создать аккаунт
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
