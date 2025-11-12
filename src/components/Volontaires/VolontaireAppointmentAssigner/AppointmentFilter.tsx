interface AppointmentFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  availableDates: string[];
  formatDate: (date: string) => string;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  disabled?: boolean;
}

const AppointmentFilter = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  selectedDate,
  setSelectedDate,
  availableDates,
  formatDate,
  selectedCount,
  totalCount,
  onSelectAll,
  disabled = false
}: AppointmentFilterProps) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Rendez-vous disponibles ({totalCount})
          {selectedDate && <span className="text-blue-600 ml-2">- {formatDate(selectedDate)}</span>}
        </h3>
        <select
          className="text-sm px-2 py-1 border border-gray-300 rounded"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="time">Trier par heure</option>
          <option value="status">Puis par statut</option>
          <option value="comment">Puis par commentaire</option>
        </select>
      </div>

      {/* Sélecteur de date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrer par date
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedDate('')}
            className={`px-3 py-2 text-sm rounded border ${
              !selectedDate
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Toutes les dates
          </button>
          {availableDates.map((date: string) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-2 text-sm rounded border ${
                selectedDate === date
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par date, heure, statut ou commentaire..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {selectedCount} sélectionnés
        </span>
        <button
          onClick={onSelectAll}
          className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          disabled={disabled || selectedCount === 0}
        >
          Tout désélectionner
        </button>
      </div>
    </div>
  );
};

export default AppointmentFilter;