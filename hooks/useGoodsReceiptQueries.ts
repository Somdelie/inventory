import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { GoodsReceiptStatus } from "@prisma/client";
import {
  goodsReceiptAPI,
  GoodsReceiptCreateDTO,
  GoodsReceiptUpdateStatusDTO,
} from "@/services/goodsReceiptAPI";

// Query keys for caching
export const goodsReceiptKeys = {
  all: ["goodsReceipts"] as const,
  lists: () => [...goodsReceiptKeys.all, "list"] as const,
  listsReceipts: (organizationId: string) =>
    [...goodsReceiptKeys.lists(), { organizationId }] as const,
  count: (organizationId: string) =>
    [...goodsReceiptKeys.lists(), "count", { organizationId }] as const,
  details: () => [...goodsReceiptKeys.all, "detail"] as const,
  detail: (id: string) => [...goodsReceiptKeys.details(), id] as const,
  lines: (receiptId: string) =>
    [...goodsReceiptKeys.detail(receiptId), "lines"] as const,
};

interface CreateGoodsReceiptOptions {
  onSuccess?: () => void;
}

// Hook to fetch goods receipts for an organization
export function useOrganizationGoodsReceipts(organizationId?: string) {
  const {
    data: goodsReceipts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: organizationId
      ? goodsReceiptKeys.listsReceipts(organizationId)
      : goodsReceiptKeys.lists(),
    queryFn: () => goodsReceiptAPI.getAllGoodsReceipts(organizationId),
  });

  return {
    goodsReceipts,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook to fetch goods receipts for an organization with suspense
export function useOrgGoodsReceipts(organizationId: string) {
  const { data: goodsReceipts = [], refetch } = useSuspenseQuery({
    queryKey: goodsReceiptKeys.listsReceipts(organizationId),
    queryFn: () => goodsReceiptAPI.getAllGoodsReceipts(organizationId),
  });

  return {
    goodsReceipts,
    refetch,
  };
}

// Hook to fetch a specific goods receipt by ID
export function useGoodsReceipt(id: string) {
  const {
    data: goodsReceipt,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: goodsReceiptKeys.detail(id),
    queryFn: () => goodsReceiptAPI.getById(id),
    enabled: !!id, // Only run the query if id is provided
  });

  return {
    goodsReceipt,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook to fetch goods receipt count
export function useGoodsReceiptCount(organizationId: string) {
  const {
    data: count = 0,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: goodsReceiptKeys.count(organizationId),
    queryFn: () => goodsReceiptAPI.getCount(organizationId),
    enabled: !!organizationId,
  });

  return {
    count,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook to create a new goods receipt
export function useCreateGoodsReceipt(options: CreateGoodsReceiptOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoodsReceiptCreateDTO) => goodsReceiptAPI.create(data),
    onSuccess: (data, variables) => {
      toast.success("Goods receipt created successfully", {
        duration: 3000,
      });

      // Invalidate specific queries
      if (variables.organizationId) {
        queryClient.invalidateQueries({
          queryKey: goodsReceiptKeys.listsReceipts(variables.organizationId),
        });
        queryClient.invalidateQueries({
          queryKey: goodsReceiptKeys.count(variables.organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.lists(),
      });

      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        duration: 3000,
      });
    },
  });
}

// Hook to update goods receipt status
export function useUpdateGoodsReceiptStatus(
  id: string,
  organizationId?: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoodsReceiptUpdateStatusDTO) =>
      goodsReceiptAPI.updateStatus(id, data),
    onSuccess: () => {
      toast.success("Goods receipt status updated successfully", {
        duration: 3000,
      });

      // Invalidate specific queries
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.detail(id),
      });

      // If we have an organizationId, invalidate organization-specific queries
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: goodsReceiptKeys.listsReceipts(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.lists(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        duration: 3000,
      });
    },
  });
}

// Hook to delete a goods receipt
export function useDeleteGoodsReceipt(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) => goodsReceiptAPI.delete(receiptId),
    onSuccess: (_, receiptId) => {
      toast.success("Goods receipt deleted successfully", {
        duration: 3000,
      });

      // Invalidate specific queries
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.detail(receiptId),
      });

      // If we have an organizationId, invalidate organization-specific queries
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: goodsReceiptKeys.listsReceipts(organizationId),
        });
        queryClient.invalidateQueries({
          queryKey: goodsReceiptKeys.count(organizationId),
        });
      }

      // Always invalidate the general lists
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.lists(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        duration: 3000,
      });
    },
  });
}

// Hook to fetch goods receipt line items
export function useGoodsReceiptLineItems(receiptId: string) {
  const {
    data: lines = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: goodsReceiptKeys.lines(receiptId),
    queryFn: () => goodsReceiptAPI.getLines(receiptId),
    enabled: !!receiptId, // Only run the query if receiptId is provided
  });

  return {
    lines,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook to add a line item to a goods receipt
export function useAddGoodsReceiptLine(
  receiptId: string,
  organizationId?: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      itemId: string;
      purchaseOrderLineId: string;
      receivedQuantity: number;
      notes?: string;
    }) => goodsReceiptAPI.addLine(receiptId, data),
    onSuccess: () => {
      toast.success("Line item added successfully", {
        duration: 3000,
      });

      // Invalidate line items for this receipt
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.lines(receiptId),
      });

      // Invalidate the receipt detail
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.detail(receiptId),
      });

      // If we have an organizationId, invalidate organization-specific queries
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: goodsReceiptKeys.listsReceipts(organizationId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        duration: 3000,
      });
    },
  });
}
