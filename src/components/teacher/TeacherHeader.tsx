interface TeacherHeaderProps {
  userName: string;
  groupsCount: number;
  tasksCount: number;
}

const TeacherHeader = ({ userName, groupsCount, tasksCount }: TeacherHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold mb-2">Добро пожаловать, {userName.split(' ')[0]}! 👋</h1>
      <p className="text-muted-foreground">
        У вас {groupsCount} групп и {tasksCount} задач в банке
      </p>
    </div>
  );
};

export default TeacherHeader;
