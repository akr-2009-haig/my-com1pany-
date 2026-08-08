'use client';

import { useState } from 'react';
import Field from './Field';

/** Renders a grouped/tabbed set of Field specs into a two-column grid. */
export default function FormBuilder({
  fields = [], groups = null, values = {}, errors = {}, onChange, columns = 2,
}) {
  const [tab, setTab] = useState(0);

  const renderFields = (list) => (
    <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : ''} gap-4`}>
      {list
        .filter((f) => (typeof f.when === 'function' ? f.when(values) : true))
        .map((f) => (
          <Field
            key={f.name}
            spec={f}
            value={values[f.name]}
            form={values}
            error={errors[f.name]}
            onChange={onChange}
          />
        ))}
    </div>
  );

  if (!groups) return renderFields(fields);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-gray-200 mb-5">
        {groups.map((g, i) => (
          <button
            key={g.label}
            type="button"
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors
              ${tab === i ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark'}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      {groups.map((g, i) => (
        <div key={g.label} className={tab === i ? 'block animate-fadeIn' : 'hidden'}>
          {g.description ? <p className="text-sm text-gray-500 mb-4">{g.description}</p> : null}
          {renderFields(g.fields)}
        </div>
      ))}
    </div>
  );
}
