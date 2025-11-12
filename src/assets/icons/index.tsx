// src/components/icons/index.js
import { ReactComponent as UsersIconSvg } from '../../assets/icons/users.svg';
import { ReactComponent as StudyIconSvg } from '../../assets/icons/study.svg';
import { ReactComponent as CalendarIconSvg } from '../../assets/icons/calendar.svg';
import { ReactComponent as ClipboardIconSvg } from '../../assets/icons/clipboard.svg';
import { ReactComponent as ChartIconSvg } from '../../assets/icons/chart.svg';
import { ReactComponent as PlusIconSvg } from '../../assets/icons/add.svg';
import { ReactComponent as ChevronRightIconSvg } from '../../assets/icons/chevron-right.svg';
import { ReactComponent as SearchIconSvg } from '../../assets/icons/search.svg';
import { ReactComponent as UserPlusIconSvg } from '../../assets/icons/user-plus.svg';
import { ReactComponent as FileTextIconSvg } from '../../assets/icons/file-text.svg';
import { ReactComponent as CalendarPlusIconSvg } from '../../assets/icons/calendar-plus.svg';
import { ReactComponent as GraphIconSvg } from '../../assets/icons/graph.svg';

// Composant de base pour les icônes
const createIconComponent = (IconSvg) => {
  return function IconComponent({ className = "", width = 24, height = 24, ...props }) {
    return (
      <IconSvg
        className={className}
        width={width}
        height={height}
        {...props}
      />
    );
  };
};

// Création des composants d'icônes
export const UsersIcon = createIconComponent(UsersIconSvg);
export const StudyIcon = createIconComponent(StudyIconSvg);
export const CalendarIcon = createIconComponent(CalendarIconSvg);
export const ClipboardIcon = createIconComponent(ClipboardIconSvg);
export const ChartIcon = createIconComponent(ChartIconSvg);
export const PlusIcon = createIconComponent(PlusIconSvg);
export const ChevronRightIcon = createIconComponent(ChevronRightIconSvg);
export const SearchIcon = createIconComponent(SearchIconSvg);
export const UserPlusIcon = createIconComponent(UserPlusIconSvg);
export const FileTextIcon = createIconComponent(FileTextIconSvg);
export const CalendarPlusIcon = createIconComponent(CalendarPlusIconSvg);
export const GraphIcon = createIconComponent(GraphIconSvg);