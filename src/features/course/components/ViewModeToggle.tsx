import { VIEW_MODES, ViewModeValue } from '../types';

interface ViewModeToggleProps {
  viewMode: ViewModeValue;
  onViewModeChange: (mode: ViewModeValue) => void;
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex border border-zinc-300 rounded-lg overflow-hidden">
      {VIEW_MODES.map((mode) => {
        const IconComponent = mode.icon;
        const isActive = viewMode === mode.value;

        return (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`p-3 transition-colors hover:cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-50 '
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
