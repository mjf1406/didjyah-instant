/** @format */

"use client";

import React, { useState, useMemo } from "react";
import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { CircleX, Search, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EnsureProfile from "@/app/(app)/_components/user/EnsureProfile";
import { useUndo, getEntityData } from "@/lib/undo";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type DidjyahRecordWithDidjyah = InstaQLEntity<
    AppSchema,
    "didjyahRecords",
    { didjyah: {}; owner: {} }
>;

const PAGE_SIZE = 20;

function DidjyahHistoryContent() {
    const user = db.useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
    const { registerAction } = useUndo();

    // Reset to page 1 when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Query for paginated records
    const { data, isLoading, error } = db.useQuery({
        didjyahRecords: {
            $: {
                where: { "owner.id": user.id },
                order: { createdDate: "desc" },
                limit: PAGE_SIZE,
                offset: (currentPage - 1) * PAGE_SIZE,
            },
            didjyah: {},
        },
    });

    // Query for total count (for pagination when no search)
    const { data: countData } = db.useQuery({
        didjyahRecords: {
            $: {
                where: { "owner.id": user.id },
            },
        },
    });

    const records = (data?.didjyahRecords || []) as DidjyahRecordWithDidjyah[];
    const allRecords = (countData?.didjyahRecords || []) as DidjyahRecordWithDidjyah[];

    // For search, we need to fetch all records and filter client-side
    // So we'll use a separate query when searching
    const { data: searchData } = db.useQuery(
        searchQuery.trim()
            ? {
                  didjyahRecords: {
                      $: {
                          where: { "owner.id": user.id },
                          order: { createdDate: "desc" },
                      },
                      didjyah: {},
                  },
              }
            : null
    );

    const searchRecords = (searchData?.didjyahRecords || []) as DidjyahRecordWithDidjyah[];

    // When searching, use search results with client-side pagination
    // When not searching, use server-side paginated records directly
    const displayRecords = useMemo(() => {
        if (!searchQuery.trim()) {
            return records;
        }
        const query = searchQuery.toLowerCase();
        const filtered = searchRecords.filter(
            (record) =>
                record.didjyah?.name?.toLowerCase().includes(query) ?? false
        );
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(startIndex, startIndex + PAGE_SIZE);
    }, [searchQuery, records, searchRecords, currentPage]);

    const totalRecords = searchQuery.trim()
        ? searchRecords.filter(
              (record) =>
                  record.didjyah?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
          ).length
        : allRecords.length;

    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    const handleDelete = async (recordId: string) => {
        try {
            const allRecordsToSearch = searchQuery.trim() ? searchRecords : allRecords;
            const record = allRecordsToSearch.find((r) => r.id === recordId);
            if (!record) return;

            // Get previous data for undo
            const previousData = await getEntityData("didjyahRecords", recordId);
            const didjyahId = record.didjyah?.id;
            const ownerId = record.owner?.id;

            await db.transact(db.tx.didjyahRecords[recordId].delete());
            setDeleteDialogOpen(null);

            if (previousData && didjyahId && ownerId) {
                registerAction({
                    type: "delete",
                    entityType: "didjyahRecords",
                    entityId: recordId,
                    previousData,
                    links: { didjyah: didjyahId, owner: ownerId },
                    message: `Record deleted from "${record.didjyah?.name || "DidjYah"}"`,
                });
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "An error occurred while deleting the record.";
            toast.error(message);
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "Unknown date";
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="m-auto flex w-full max-w-4xl items-center justify-center lg:min-w-3xl">
                <Skeleton className="h-8 w-32" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-auto flex h-auto w-full items-center justify-center">
                <div className="max-w-5xl px-4">
                    <Alert
                        variant="destructive"
                        className="flex w-full items-center gap-4"
                    >
                        <CircleX
                            className="shrink-0"
                            style={{ width: "36px", height: "36px" }}
                        />
                        <div className="w-full">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error instanceof Error
                                    ? error.message
                                    : "An error occurred"}
                            </AlertDescription>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <main className="p-2 md:p-4">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <h1 className="mb-4 text-2xl font-bold">
                        DidjYah Records History
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by DidjYah name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {displayRecords.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? `No records found matching "${searchQuery}"`
                                : "No records found"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {displayRecords.map((record) => (
                            <div
                                key={record.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold">
                                        {record.didjyah?.name || "Unknown DidjYah"}
                                    </h3>
                                    <div className="mt-1 space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Created: {formatDate(record.createdDate)}
                                        </p>
                                        {record.endDate && (
                                            <p className="text-sm text-muted-foreground">
                                                Ended: {formatDate(record.endDate)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setDeleteDialogOpen(record.id)
                                        }
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog
                                        open={deleteDialogOpen === record.id}
                                        onOpenChange={(open) =>
                                            setDeleteDialogOpen(
                                                open ? record.id : null
                                            )
                                        }
                                    >
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Delete Record?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to
                                                    delete this record from{" "}
                                                    <b>
                                                        {record.didjyah?.name ||
                                                            "DidjYah"}
                                                    </b>
                                                    ? This action cannot be
                                                    undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleDelete(record.id)
                                                    }
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage > 1) {
                                                        setCurrentPage(
                                                            currentPage - 1
                                                        );
                                                        window.scrollTo({
                                                            top: 0,
                                                            behavior: "smooth",
                                                        });
                                                    }
                                                }}
                                                className={
                                                    currentPage === 1
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1
                                        )
                                            .filter((page) => {
                                                // Show first page, last page, current page, and pages around current
                                                if (page === 1) return true;
                                                if (page === totalPages)
                                                    return true;
                                                if (
                                                    Math.abs(page - currentPage) <=
                                                    1
                                                )
                                                    return true;
                                                return false;
                                            })
                                            .map((page, index, array) => {
                                                // Add ellipsis between non-consecutive pages
                                                const showEllipsisBefore =
                                                    index > 0 &&
                                                    array[index - 1] !== page - 1;
                                                return (
                                                    <React.Fragment key={page}>
                                                        {showEllipsisBefore && (
                                                            <PaginationItem>
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        )}
                                                        <PaginationItem>
                                                            <PaginationLink
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setCurrentPage(
                                                                        page
                                                                    );
                                                                    window.scrollTo(
                                                                        {
                                                                            top: 0,
                                                                            behavior:
                                                                                "smooth",
                                                                        }
                                                                    );
                                                                }}
                                                                isActive={
                                                                    currentPage ===
                                                                    page
                                                                }
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    </React.Fragment>
                                                );
                                            })}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (
                                                        currentPage < totalPages
                                                    ) {
                                                        setCurrentPage(
                                                            currentPage + 1
                                                        );
                                                        window.scrollTo({
                                                            top: 0,
                                                            behavior: "smooth",
                                                        });
                                                    }
                                                }}
                                                className={
                                                    currentPage === totalPages
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}

                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {displayRecords.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{" "}
                            {Math.min(
                                currentPage * PAGE_SIZE,
                                totalRecords
                            )}{" "}
                            of {totalRecords} records
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default function DidjyahHistoryPage() {
    return (
        <>
            <db.SignedIn>
                <EnsureProfile />
                <DidjyahHistoryContent />
            </db.SignedIn>
            <db.SignedOut>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h2 className="mb-4 text-xl font-bold">
                            Sign in to view DidjYah History
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please sign in to view your DidjYah records history.
                        </p>
                    </div>
                </div>
            </db.SignedOut>
        </>
    );
}
