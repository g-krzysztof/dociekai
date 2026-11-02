import { CourseCursorStates } from '@/components/block-lesson/course-cursor-states';

export default function HistoriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="course-cursors contents">
      <CourseCursorStates />
      {children}
    </div>
  );
}
