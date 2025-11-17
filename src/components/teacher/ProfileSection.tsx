import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSectionProps {
  userName: string;
  loading: boolean;
  onUpdateProfile: (data: { full_name: string; email: string }) => void;
}

const ProfileSection = ({ userName, loading, onUpdateProfile }: ProfileSectionProps) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', email: '' });

  const handleSubmit = () => {
    onUpdateProfile(profileData);
    setEditingProfile(false);
    setProfileData({ full_name: '', email: '' });
  };

  const handleCancel = () => {
    setEditingProfile(false);
    setProfileData({ full_name: '', email: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Настройки профиля</h2>
      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
          <CardDescription>Управляйте своими данными</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="profileName">Имя</Label>
                <Input
                  id="profileName"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder={userName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileEmail">Email</Label>
                <Input
                  id="profileEmail"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Имя</label>
                <p className="text-muted-foreground mt-1">{userName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Роль</label>
                <p className="text-muted-foreground mt-1">Учитель</p>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setEditingProfile(true)}>
                Редактировать профиль
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
