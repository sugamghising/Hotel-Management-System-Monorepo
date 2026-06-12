"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import {
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
} from "@/lib/hooks/useInventory";
import { PageHeader } from "@/components/layout/PageHeader";
import { LowStockBanner } from "./LowStockBanner";
import { ItemsTab } from "./tabs/ItemsTab";
import { TransactionsTab } from "./tabs/TransactionsTab";
import { VendorsTab } from "./tabs/VendorsTab";
import { PurchaseOrdersTab } from "./tabs/PurchaseOrdersTab";
import { ItemDetailSheet } from "./ItemDetailSheet";
import { AdjustStockDialog } from "./AdjustStockDialog";
import { ConsumeStockDialog } from "./ConsumeStockDialog";
import { PhysicalCountDialog } from "./PhysicalCountDialog";
import { CreateItemDialog } from "./CreateItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { CreatePODialog } from "./CreatePODialog";
import { PODetailSheet } from "./PODetailSheet";
import { ReceiveGoodsDialog } from "./ReceiveGoodsDialog";

export default function InventoryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();

  const canRead = usePermission("INVENTORY.READ");
  const canAdjust = usePermission("INVENTORY.ADJUST");
  const canCreate = usePermission("INVENTORY.CREATE");
  const canConsume = usePermission("INVENTORY.CONSUME");
  const canUpdate = usePermission("INVENTORY.UPDATE");
  const canSubmitPO = usePermission("INVENTORY.PO.SUBMIT");
  const canApprovePO = usePermission("INVENTORY.PO.APPROVE");
  const canReceivePO = usePermission("INVENTORY.PO.RECEIVE");
  const canManageVendors = usePermission("INVENTORY.VENDOR.CREATE");
  const canApproveVendors = usePermission("INVENTORY.VENDOR.APPROVE");

  const { mutate: submitPO } = useSubmitPurchaseOrder();
  const { mutate: approvePO } = useApprovePurchaseOrder();
  const { mutate: cancelPO } = useCancelPurchaseOrder();

  const tab = searchParams.get("tab") ?? "items";

  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [adjustItemId, setAdjustItemId] = useState<string | null>(null);
  const [consumeItemId, setConsumeItemId] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [physicalCountOpen, setPhysicalCountOpen] = useState(false);
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [detailPOId, setDetailPOId] = useState<string | null>(null);
  const [receivePOId, setReceivePOId] = useState<string | null>(null);
  const [defaultPOVendor, setDefaultPOVendor] = useState<string | undefined>(undefined);

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      router.replace(`${pathname}?${params}`);
    },
    [pathname, searchParams, router],
  );

  const handleTabChange = useCallback(
    (newTab: string) => {
      navigate({ tab: newTab });
    },
    [navigate],
  );

  const handleLowStockViewAll = useCallback(() => {
    navigate({ tab: "items", stock: "low", page: null });
  }, [navigate]);

  const handleCreatePO = useCallback((vendorId?: string) => {
    setDefaultPOVendor(vendorId);
    navigate({ tab: "orders" });
    setCreatePOOpen(true);
  }, [navigate]);

  if (!canRead) {
    return (
      <div>
        <PageHeader title="Inventory & Procurement" />
        <div className="text-center py-16">
          <p className="text-muted-foreground">You do not have access to inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Inventory & Procurement"
        subtitle="Manage stock, vendors, and purchase orders"
        actions={
          <>
            {canAdjust && (
              <Button variant="outline" size="sm" onClick={() => setPhysicalCountOpen(true)}>
                <ClipboardList className="h-4 w-4 mr-1.5" /> Physical Count
              </Button>
            )}
            {canCreate && (
              <Button size="sm" onClick={() => setCreateItemOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> New Item
              </Button>
            )}
          </>
        }
      />

      <LowStockBanner onViewAll={handleLowStockViewAll} />

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <ItemsTab
            onAdjust={setAdjustItemId}
            onConsume={setConsumeItemId}
            onView={setDetailItemId}
            onEdit={setEditItemId}
            onCreateItem={() => setCreateItemOpen(true)}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTab />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <VendorsTab onNewPO={handleCreatePO} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <PurchaseOrdersTab
            onCreatePO={() => { setDefaultPOVendor(undefined); setCreatePOOpen(true); }}
            onViewDetail={setDetailPOId}
            onReceive={setReceivePOId}
          />
        </TabsContent>
      </Tabs>

      <ItemDetailSheet
        itemId={detailItemId}
        open={!!detailItemId}
        onClose={() => setDetailItemId(null)}
        onAdjust={(id) => { setDetailItemId(null); setAdjustItemId(id); }}
        onConsume={(id) => { setDetailItemId(null); setConsumeItemId(id); }}
        onEdit={(id) => { setDetailItemId(null); setEditItemId(id); }}
        canAdjust={canAdjust}
        canConsume={canConsume}
        canUpdate={canUpdate}
      />

      <AdjustStockDialog itemId={adjustItemId} open={!!adjustItemId} onClose={() => setAdjustItemId(null)} />
      <ConsumeStockDialog itemId={consumeItemId} open={!!consumeItemId} onClose={() => setConsumeItemId(null)} />
      <CreateItemDialog open={createItemOpen} onClose={() => setCreateItemOpen(false)} />
      <EditItemDialog itemId={editItemId} open={!!editItemId} onClose={() => setEditItemId(null)} />
      <PhysicalCountDialog open={physicalCountOpen} onClose={() => setPhysicalCountOpen(false)} />

      <CreatePODialog
        open={createPOOpen}
        onClose={() => { setCreatePOOpen(false); setDefaultPOVendor(undefined); }}
        defaultVendorId={defaultPOVendor}
      />

      <PODetailSheet
        poId={detailPOId}
        open={!!detailPOId}
        onClose={() => setDetailPOId(null)}
        onSubmit={(id) => submitPO(id)}
        onApprove={(id) => approvePO(id)}
        onReceive={(id) => { setDetailPOId(null); setReceivePOId(id); }}
        onCancel={(id) => cancelPO({ poId: id })}
        canSubmit={canSubmitPO}
        canApprove={canApprovePO}
        canReceive={canReceivePO}
      />

      <ReceiveGoodsDialog poId={receivePOId} open={!!receivePOId} onClose={() => setReceivePOId(null)} />
    </div>
  );
}
