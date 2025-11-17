// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="text-center space-y-6 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
          <span className="text-5xl">🎓</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Образовательная платформа</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Современная система для онлайн обучения и управления заданиями
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a href="/login" className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            Войти
          </a>
          <a href="/register" className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-input bg-background font-medium hover:bg-accent transition-colors">
            Регистрация
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;