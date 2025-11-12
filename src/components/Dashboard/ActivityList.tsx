import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ActivityListProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function ActivityList<T extends { id?: string | number }>({
  title,
  items,
  renderItem
}: ActivityListProps<T>) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun élément à afficher</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={item.id ?? index}>
                {renderItem(item)}
                {index < items.length - 1 && <Separator className="mt-3" />}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityList;
