import Counter from '../shared/Counter';
import Icon from '../shared/Icon';

export default function StatsBar({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <section className="bg-primary py-12 md:py-14">
      <div className="container-app">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-white/20">
          {stats.map((s) => (
            <div key={s._id} className="text-center px-3 py-4">
              <Icon name={s.icon} className="w-8 h-8 text-white/90 mx-auto mb-3" />
              <p className="text-white font-extrabold text-3xl md:text-4xl flex items-center justify-center gap-0.5" dir="ltr">
                <Counter value={s.value} />
                {s.suffix ? <span>{s.suffix}</span> : null}
                {s.showPlus !== false ? <span>+</span> : null}
              </p>
              <p className="text-white/80 text-sm mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
