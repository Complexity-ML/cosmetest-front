import type { ImgHTMLAttributes } from 'react';
import usersIconSvg from '../../assets/icons/users.svg';
import studyIconSvg from '../../assets/icons/study.svg';
import calendarIconSvg from '../../assets/icons/calendar.svg';
import clipboardIconSvg from '../../assets/icons/clipboard.svg';
import chartIconSvg from '../../assets/icons/chart.svg';
import plusIconSvg from '../../assets/icons/add.svg';
import chevronRightIconSvg from '../../assets/icons/chevron-right.svg';
import searchIconSvg from '../../assets/icons/search.svg';
import userPlusIconSvg from '../../assets/icons/user-plus.svg';
import fileTextIconSvg from '../../assets/icons/file-text.svg';
import calendarPlusIconSvg from '../../assets/icons/calendar-plus.svg';
import graphIconSvg from '../../assets/icons/graph.svg';

// Composant de base pour les icônes
const createIconComponent = (iconSrc: string) => {
  return function IconComponent({ className = "", width = 24, height = 24, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
      <img
        src={iconSrc}
        alt=""
        className={className}
        width={width}
        height={height}
        {...props}
      />
    );
  };
};

// Création des composants d'icônes
export const UsersIcon = createIconComponent(usersIconSvg);
export const StudyIcon = createIconComponent(studyIconSvg);
export const CalendarIcon = createIconComponent(calendarIconSvg);
export const ClipboardIcon = createIconComponent(clipboardIconSvg);
export const ChartIcon = createIconComponent(chartIconSvg);
export const PlusIcon = createIconComponent(plusIconSvg);
export const ChevronRightIcon = createIconComponent(chevronRightIconSvg);
export const SearchIcon = createIconComponent(searchIconSvg);
export const UserPlusIcon = createIconComponent(userPlusIconSvg);
export const FileTextIcon = createIconComponent(fileTextIconSvg);
export const CalendarPlusIcon = createIconComponent(calendarPlusIconSvg);
export const GraphIcon = createIconComponent(graphIconSvg);