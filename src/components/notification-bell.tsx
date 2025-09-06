
'use client';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { notifications as serverNotifications, Notification } from '@/lib/data';
import { Separator } from './ui/separator';

const NOTIFICATION_READ_STATE_KEY = 'read_notifications';

const NotificationBell = () => {
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // When the component mounts or the popover is opened, we sync with the latest data.
    // In a real app, this would be an API fetch. Here, we re-import from our "data" source.
    const readIds = JSON.parse(localStorage.getItem(NOTIFICATION_READ_STATE_KEY) || '[]');
    const updatedNotifications = serverNotifications.map(n => ({
      ...n,
      read: readIds.includes(n.id),
    }));
    setCurrentNotifications(updatedNotifications.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [isOpen]); // Re-run when popover is opened to get the latest notifications

  const unreadCount = currentNotifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const allIds = currentNotifications.map(n => n.id);
    localStorage.setItem(NOTIFICATION_READ_STATE_KEY, JSON.stringify(allIds));
    setCurrentNotifications(currentNotifications.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
        <div className="flex justify-between items-center p-4">
            <div>
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">You have {unreadCount} unread messages.</p>
            </div>
             {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark all as read
                </Button>
            )}
        </div>
        <Separator />
        <div className="p-2 max-h-80 overflow-y-auto">
          {currentNotifications.length > 0 ? (
            currentNotifications.map((notification) => (
              <div key={notification.id} className={`mb-1 p-2 rounded-lg ${!notification.read ? 'bg-primary/5' : ''}`}>
                <div className="grid grid-cols-[25px_1fr] items-start">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" style={{ opacity: notification.read ? 0 : 1}} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                       {notification.image && (
                          <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                              <img src={notification.image} alt={notification.title} className="object-cover w-full h-full" />
                          </div>
                      )}
                      <p className="text-xs text-muted-foreground/70 pt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">No new notifications.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
