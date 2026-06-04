"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  useGuests,
  useVipGuests,
  useCreateGuest,
  type GuestListItem as GuestListItemType,
} from "@/lib/hooks/useGuests";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  UserPlus,
  Users,
  Hotel,
  Search as SearchIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate, formatInitials } from "@/lib/utils/formatters";
import { VIP_MAP } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";
import { GuestFilters } from "./GuestFilters";
import { CreateGuestDialog } from "./CreateGuestDialog";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
];

function hashColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function GuestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeHotel = useAuthStore((s) => s.activeHotel);

  const canCreate = usePermission("GUEST.CREATE");
  const canEditGuest = usePermission("GUEST.UPDATE");
  const canCreateReservation = usePermission("RESERVATION.CREATE");

  // URL-synced state
  const initialTab = searchParams.get("tab") === "vip" ? "vip" : "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [guestType, setGuestType] = useState(searchParams.get("guestType") ?? "all");
  const [vipStatus, setVipStatus] = useState(searchParams.get("vipStatus") ?? "all");
  const [page, setPageLocal] = useState(Number(searchParams.get("page")) || 1);

  // Debounced search for API
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPageLocal(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Sync to URL
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("tab", activeTab);
    if (search) params.set("search", search);
    if (guestType && guestType !== "all") params.set("guestType", guestType);
    if (vipStatus && vipStatus !== "all") params.set("vipStatus", vipStatus);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [activeTab, search, guestType, vipStatus, page, router, pathname]);

  // Query
  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = { page, limit: 20 };
    if (debouncedSearch) p.search = debouncedSearch;
    if (guestType && guestType !== "all") p.guestType = guestType;
    if (vipStatus && vipStatus !== "all") p.vipStatus = vipStatus;
    return p;
  }, [debouncedSearch, guestType, vipStatus, page]);

  const { data: guestData, isLoading, isError, refetch } = useGuests(queryParams);
  const { data: vipGuests, isLoading: vipLoading } = useVipGuests();

  const guests = guestData?.guests ?? [];
  const total = guestData?.pagination?.total ?? 0;
  const totalPages = guestData?.pagination?.totalPages ?? 0;

  // Create dialog
  const createGuest = useCreateGuest();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Handlers
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as "all" | "vip");
    setPageLocal(1);
  }, []);

  const hasActiveFilters = !!(search || (guestType && guestType !== "all") || (vipStatus && vipStatus !== "all"));

  const handleGuestTypeChange = useCallback((value: string) => {
    setGuestType(value);
    setPageLocal(1);
  }, []);

  const handleVipStatusChange = useCallback((value: string) => {
    setVipStatus(value);
    setPageLocal(1);
  }, []);

  const handleClear = useCallback(() => {
    setSearch("");
    setGuestType("all");
    setVipStatus("all");
    setPageLocal(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPageLocal(newPage);
  }, []);

  const handleCreateSuccess = useCallback(
    (guest: { id: string }) => {
      setCreateDialogOpen(false);
      router.push(`/guests/${guest.id}`);
    },
    [router],
  );

  // Columns
  const columns: ColumnDef<GuestListItemType>[] = useMemo(
    () => [
      {
        id: "guest",
        header: "Guest",
        size: 280,
        cell: ({ row }) => {
          const g = row.original;
          const vip = g.vipStatus !== "NONE" ? VIP_MAP[g.vipStatus] : null;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={cn("text-white text-xs font-semibold", hashColor(g.firstName + g.lastName))}>
                  {formatInitials(g.firstName, g.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm truncate">
                    {g.firstName} {g.lastName}
                  </span>
                  {vip && (
                    <Badge className={cn("text-[10px] px-1.5 py-0 h-auto font-medium border", vip.color)}>
                      {vip.label}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {g.email ?? ""}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "contact",
        header: "Contact",
        size: 200,
        cell: ({ row }) => {
          const g = row.original;
          return (
            <div>
              <span className="text-sm">{g.phone ?? "\u2014"}</span>
              {g.companyName && (
                <p className="text-xs text-muted-foreground">{g.companyName}</p>
              )}
            </div>
          );
        },
      },
      {
        id: "type",
        header: "Type",
        size: 130,
        cell: ({ row }) => {
          const g = row.original;
          const colors: Record<string, string> = {
            TRANSIENT: "bg-gray-100 text-gray-700 border-gray-200",
            CORPORATE: "bg-blue-100 text-blue-700 border-blue-200",
            GROUP: "bg-purple-100 text-purple-700 border-purple-200",
            COMP: "bg-green-100 text-green-700 border-green-200",
            STAFF: "bg-orange-100 text-orange-700 border-orange-200",
          };
          return (
            <Badge
              variant="outline"
              className={cn(
                "font-medium text-[11px] px-2 py-0.5 h-auto",
                colors[g.guestType] ?? "bg-gray-100 text-gray-600",
              )}
            >
              {g.guestType}
            </Badge>
          );
        },
      },
      {
        id: "stays",
        header: "Stays",
        size: 120,
        cell: ({ row }) => {
          const g = row.original;
          return (
            <div>
              <span className="font-semibold text-sm">{g.totalStays}</span>
              <p className="text-xs text-muted-foreground">
                {g.lastStayDate
                  ? `Last: ${formatDate(g.lastStayDate)}`
                  : "Never"}
              </p>
            </div>
          );
        },
      },
      {
        id: "spend",
        header: "Total Spend",
        size: 140,
        cell: ({ row }) => {
          const g = row.original;
          const revenue = g.totalRevenue;
          if (!revenue || revenue === 0) {
            return <span className="text-sm text-muted-foreground">\u2014</span>;
          }
          return (
            <span className="text-sm font-medium">
              {formatCurrency(revenue, activeHotel?.currencyCode ?? "USD")}
            </span>
          );
        },
      },
      {
        id: "actions",
        size: 60,
        header: "",
        cell: ({ row }) => {
          const g = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/guests/${g.id}`)}>
                  View Profile
                </DropdownMenuItem>
                {canCreateReservation && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/hotels/${activeHotel?.id ?? ""}/reservations/new?guestId=${g.id}`,
                      )
                    }
                  >
                    New Reservation
                  </DropdownMenuItem>
                )}
                {canEditGuest && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toast.info("Edit from detail page")}
                    >
                      Edit
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, activeHotel, canCreateReservation, canEditGuest],
  );

  // VIP card grid
  const sortedVipGuests = useMemo(() => {
    if (!vipGuests) return [];
    const tierOrder: Record<string, number> = {
      BLACK: 0, PLATINUM: 1, GOLD: 2, SILVER: 3, BRONZE: 4, NONE: 5,
    };
    return [...vipGuests].sort((a, b) => {
      const tA = tierOrder[a.vipStatus] ?? 5;
      const tB = tierOrder[b.vipStatus] ?? 5;
      if (tA !== tB) return tA - tB;
      return (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0);
    });
  }, [vipGuests]);

  const vipError = !activeHotel && activeTab === "vip";

  // Pagination
  const start = (page - 1) * 20 + 1;
  const end = Math.min(page * 20, total);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <PageHeader
        title="Guests"
        subtitle={`${total.toLocaleString()} profiles`}
        actions={
          canCreate && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Guest
            </Button>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All Guests
          </TabsTrigger>
          <TabsTrigger value="vip" className="gap-2">
            <UserPlus className="h-4 w-4" />
            VIP Guests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          <GuestFilters
            search={search}
            onSearchChange={setSearch}
            guestType={guestType}
            onGuestTypeChange={handleGuestTypeChange}
            vipStatus={vipStatus}
            onVipStatusChange={handleVipStatusChange}
            hasActiveFilters={hasActiveFilters}
            onClear={handleClear}
          />

          {isError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-muted-foreground">Failed to load guests</p>
                <Button variant="outline" onClick={() => refetch()} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Try again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={guests}
                isLoading={isLoading}
                pageSize={Math.max(guests.length, 20)}
                onRowClick={(row) => router.push(`/guests/${row.id}`)}
                emptyMessage={
                  search
                    ? `No results for "${search}"`
                    : "No guests found"
                }
                emptyIcon={<SearchIcon className="h-8 w-8 opacity-20" />}
                hidePagination
              />
              {total > 20 && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">
                    Showing {start}\u2013{end} of {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="px-2 text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="vip" className="mt-4">
          {vipError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                <Hotel className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Select a hotel to view VIP guests.
                </p>
              </CardContent>
            </Card>
          ) : vipLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedVipGuests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                <UserPlus className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No VIP guests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedVipGuests.map((g) => {
                const vip = VIP_MAP[g.vipStatus];
                return (
                  <Card key={g.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback
                                className={cn(
                                  "text-white text-lg font-semibold",
                                  hashColor(g.firstName + g.lastName),
                                )}
                              >
                                {formatInitials(g.firstName, g.lastName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {g.firstName} {g.lastName}
                              </span>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-auto font-medium border",
                                  vip.color,
                                )}
                              >
                                {vip.label}
                              </Badge>
                            </div>
                            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                              <p>{g.totalStays} stays</p>
                              <p>
                                {formatCurrency(
                                  g.totalRevenue ?? 0,
                                  activeHotel?.currencyCode ?? "USD",
                                )}
                              </p>
                              {g.lastStayDate && (
                                <p className="text-xs">
                                  Last visit: {formatDate(g.lastStayDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 h-8 text-xs"
                          onClick={() => router.push(`/guests/${g.id}`)}
                        >
                          View Profile
                        </Button>
                        {canCreateReservation && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={() =>
                              router.push(
                                `/hotels/${activeHotel?.id ?? ""}/reservations/new?guestId=${g.id}`,
                              )
                            }
                          >
                            New Reservation
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGuestDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
