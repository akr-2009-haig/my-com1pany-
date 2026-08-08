import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'لا توجد بيانات', text = '', icon: IconCmp = Inbox, action = null, className = '' }) {
  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      <div className="w-20 h-20 rounded-full bg-gray-50 text-gray-300 grid place-items-center mx-auto mb-5">
        <IconCmp className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
      {text && <p className="text-gray-400 text-sm max-w-md mx-auto">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
