'use client';
import { useState } from 'react';
import { Bell, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { notifications as mockNotifications } from '@/lib/data';
import { Separator } from './ui/separator';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <h4 className="font-medium leading-none">Notifications</h4>
          <p className="text-sm text-muted-foreground">You have {unreadCount} unread messages.</p>
        </div>
        <Separator />
        <div className="p-2 max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className={`flex h-2 w-2 translate-y-1 rounded-full ${!notification.read ? 'bg-primary' : ''}`} />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">No new notifications.</p>
          )}
        </div>
        {unreadCount > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button onClick={markAllAsRead} className="w-full" size="sm">
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
