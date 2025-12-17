import { Package, Layers, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            id: 'barang',
            label: 'Barang',
            icon: Package,
        },
        {
            id: 'satuan',
            label: 'Satuan',
            icon: Layers,
        },
        {
            id: 'kategori',
            label: 'Kategori',
            icon: Tag,
        }
    ];

    return (
        <aside className={cn(
            "bg-card border-r border-border min-h-screen transition-all duration-300 ease-in-out relative",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                    "absolute -right-4 top-6 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-accent hover:shadow-lg",
                    "transition-all duration-300"
                )}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>

            <div className="p-6">
                {/* Logo/Brand */}
                <div className={cn(
                    "flex items-center gap-2 mb-8 transition-all duration-300",
                    isCollapsed ? "justify-center" : ""
                )}>
                    <img src="/inventory.svg" alt="Inventory Logo" className="h-8 w-8 flex-shrink-0" />
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Inventory</h1>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group relative",
                                    isActive && !isCollapsed
                                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                        : "text-foreground hover:bg-accent",
                                    isCollapsed && "justify-center px-2"
                                )}
                                title={isCollapsed ? item.label : ''}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground group-hover:text-foreground"
                                )} />

                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className={cn(
                                            "text-sm font-medium whitespace-nowrap",
                                            isActive ? "text-blue-700 dark:text-blue-300" : "text-foreground"
                                        )}>
                                            {item.label}
                                        </div>
                                    </div>
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-border shadow-md">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
