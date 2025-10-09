import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api";
import { Notification } from "../../components";
import { RefreshCw } from "lucide-react";

/* ----------------------------- Types / Helpers ----------------------------- */
type Role = "user" | "org" | "emp" | "admin" | "super_admin";

export type Account = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    avatarUrl?: string | null;
    createdAt?: string | null;
    isActive?: boolean;
    raw?: any;
};

type RawRole = { _id?: string; name: string };
type AccountRaw = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isActive?: boolean;
    role: RawRole;
    createdAt?: string;
    updatedAt?: string;
    [k: string]: any;
};

type ApiResponse = {
    success: boolean;
    message?: string;
    data: AccountRaw[];
};

/* 🚨 Removed "super_admin" from roles shown in UI */
const AVAILABLE_ROLES: Role[] = ["user", "org", "emp", "admin"];

const ROLE_BADGE_CLASS: Record<Role, string> = {
    user: "bg-gray-100 text-gray-800",
    org: "bg-yellow-100 text-yellow-800",
    emp: "bg-blue-100 text-blue-800",
    admin: "bg-indigo-100 text-indigo-800",
    super_admin: "bg-red-100 text-red-800",
};

const normalizeRoleName = (roleName?: string): Role => {
    if (!roleName) return "user";
    const normalized = roleName.trim().toLowerCase().replace(/-/g, "_");
    if (AVAILABLE_ROLES.includes(normalized as Role)) return normalized as Role;
    if (normalized.includes("super")) return "super_admin";
    if (normalized.includes("admin")) return "admin";
    if (normalized.includes("org")) return "org";
    if (normalized.includes("emp")) return "emp";
    return "user";
};

const safeDate = (d?: string): string | null => {
    if (!d) return null;
    try {
        const parsed = new Date(d);
        if (isNaN(parsed.getTime())) return null;
        return parsed.toISOString();
    } catch {
        return null;
    }
};

/* -------------------------- Small UI subcomponents ------------------------- */
const Avatar: React.FC<{
    name?: string;
    src?: string | null;
    size?: number;
}> = ({ name, src, size = 56 }) => {
    const initials =
        name
            ?.split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() ?? "—";
    return src ? (
        <img
            src={src}
            alt={name}
            style={{ width: size, height: size }}
            className="rounded-xl object-cover"
        />
    ) : (
        <div
            style={{ width: size, height: size }}
            className="rounded-xl bg-gray-50 flex items-center justify-center text-lg font-semibold text-gray-700"
            aria-hidden
        >
            {initials}
        </div>
    );
};

const StatusDot: React.FC<{ active?: boolean | null }> = ({ active }) => (
    <span
        className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
            active ? "bg-green-500" : "bg-red-400"
        }`}
        aria-hidden
    />
);

/* --------------------------- Main Accounts Page --------------------------- */
const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeRoles, setActiveRoles] = useState<Set<Role>>(new Set());
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

    /* --------------------------- Fetch Accounts --------------------------- */
    const fetchAccounts = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = "/admin/accounts";
            const res = await axiosInstance.get<ApiResponse>(endpoint);

            if (res.data?.success) {
                const rawList = res.data.data ?? [];
                const mapped: Account[] = rawList
                    .map((r) => ({
                        id: r._id,
                        name: r.name?.trim() ?? "—",
                        email: r.email ?? "",
                        phone: r.phone ?? "",
                        isActive: r.isActive,
                        role: normalizeRoleName(r.role?.name),
                        avatarUrl: r["avatarUrl"] ?? null,
                        createdAt: safeDate(r.createdAt) ?? null,
                        raw: r,
                    }))
                    /* 🚨 filter out super_admin here */
                    .filter((a) => a.role !== "super_admin");
                setAccounts(mapped);
            } else {
                const msg = res.data?.message ?? "Failed to fetch accounts";
                setError(msg);
                setNotification({ message: msg, type: "error" });
            }
        } catch (err: any) {
            console.error("Accounts fetch error", err);
            const msg =
                err?.response?.data?.message || err?.message || "Network error";
            setError(msg);
            setNotification({ message: msg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    // Debounce search query
    useEffect(() => {
        const id = setTimeout(
            () => setDebouncedQuery(query.trim().toLowerCase()),
            300
        );
        return () => clearTimeout(id);
    }, [query]);

    const toggleRole = (role: Role) => {
        setPage(1);
        setActiveRoles((prev) => {
            const copy = new Set(prev);
            if (copy.has(role)) copy.delete(role);
            else copy.add(role);
            return copy;
        });
    };

    const clearFilters = () => {
        setActiveRoles(new Set());
        setQuery("");
        setPage(1);
    };

    const handleRefresh = () => {
        fetchAccounts();
    };

    const filteredAccounts = useMemo(() => {
        const q = debouncedQuery;
        return accounts.filter((acc) => {
            if (activeRoles.size > 0 && !activeRoles.has(acc.role))
                return false;
            if (!q) return true;
            return (
                (acc.name ?? "").toLowerCase().includes(q) ||
                (acc.email ?? "").toLowerCase().includes(q) ||
                (acc.phone ?? "").toLowerCase().includes(q)
            );
        });
    }, [accounts, activeRoles, debouncedQuery]);

    const countsByRole = useMemo(() => {
        const map = new Map<Role, number>();
        AVAILABLE_ROLES.forEach((r) => map.set(r, 0));
        accounts.forEach((a) => map.set(a.role, (map.get(a.role) ?? 0) + 1));
        return map;
    }, [accounts]);

    // Pagination slice
    const totalPages = Math.max(
        1,
        Math.ceil(filteredAccounts.length / PAGE_SIZE)
    );
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const pageSlice = filteredAccounts.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    /* --------------------------- Render --------------------------- */
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                            Accounts
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            All accounts — excluding super admin.
                        </p>
                    </div>

                    {/* Search & buttons */}
                    <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                        <label htmlFor="accounts-search" className="sr-only">
                            Search accounts
                        </label>
                        <div className="relative flex-1 min-w-[160px]">
                            <input
                                id="accounts-search"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search name, email or phone..."
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                            />
                            {query && (
                                <button
                                    aria-label="Clear search"
                                    onClick={() => {
                                        setQuery("");
                                        setPage(1);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <button
                            onClick={clearFilters}
                            className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:shadow-sm text-sm flex items-center gap-1"
                        >
                            Clear
                        </button>

                        <button
                            onClick={handleRefresh}
                            className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Role filters — no super_admin */}
                <div className="mb-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {AVAILABLE_ROLES.map((role) => {
                            const active = activeRoles.has(role);
                            return (
                                <button
                                    key={role}
                                    onClick={() => toggleRole(role)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                                        active
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-white text-gray-700 border border-gray-200"
                                    }`}
                                    title={`${
                                        countsByRole.get(role) ?? 0
                                    } accounts`}
                                    aria-pressed={active}
                                >
                                    {role.replace("_", " ")}{" "}
                                    <span className="text-xs text-gray-400">
                                        ({countsByRole.get(role) ?? 0})
                                    </span>
                                </button>
                            );
                        })}
                        <div className="ml-2 text-sm text-gray-500 flex items-center">
                            Filter by role
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div>
                    {loading ? (
                        <SkeletonGrid />
                    ) : error ? (
                        <div className="py-6 px-4 rounded-xl bg-red-50 text-red-700">
                            {error}
                        </div>
                    ) : pageSlice.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            No accounts found.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pageSlice.map((acc) => (
                                    <AccountCard key={acc.id} account={acc} />
                                ))}
                            </div>

                            {/* Pagination controls */}
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-sm text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {(page - 1) * PAGE_SIZE + 1}
                                    </span>{" "}
                                    —{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            page * PAGE_SIZE,
                                            filteredAccounts.length
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {filteredAccounts.length}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        disabled={page === 1}
                                        className="px-3 py-1 rounded-xl bg-white border border-gray-200 hover:shadow-sm disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <div className="px-3 py-1 rounded-xl border border-gray-100 bg-white text-sm">
                                        Page {page} / {totalPages}
                                    </div>
                                    <button
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        disabled={page === totalPages}
                                        className="px-3 py-1 rounded-xl bg-white border border-gray-200 hover:shadow-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {notification && (
                <div className="fixed top-5 right-5 z-50">
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default AccountsPage;

/* --------------------------- AccountCard --------------------------- */
const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
    const { name, email, phone, avatarUrl, role, createdAt, isActive } =
        account;
    const roleLabel = role.replace("_", " ");

    return (
        <article
            className="rounded-2xl p-4 bg-white shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4"
            aria-labelledby={`acct-${account.id}-name`}
        >
            <div className="flex-shrink-0">
                <Avatar name={name} src={avatarUrl} size={64} />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3
                            id={`acct-${account.id}-name`}
                            className="text-sm font-semibold text-gray-800"
                        >
                            {name}
                        </h3>
                        <div className="text-xs text-gray-500 truncate max-w-[240px]">
                            {email}
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <div
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_BADGE_CLASS[role]}`}
                        >
                            {roleLabel}
                        </div>
                        {createdAt && (
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(createdAt).toLocaleDateString()}
                            </div>
                        )}
                        {isActive === false && (
                            <div className="text-xs text-red-500 mt-1">
                                Inactive
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                        {phone && (
                            <div className="text-sm text-gray-600">{phone}</div>
                        )}
                        <div className="mt-1 text-xs text-gray-400 flex items-center">
                            <StatusDot active={isActive ?? true} />
                            <span>{isActive ? "Active" : "Inactive"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 rounded-xl text-sm bg-white border border-gray-200 hover:shadow-sm"
                            onClick={() => console.log("view", account.id)}
                        >
                            View
                        </button>
                        <button
                            className="px-3 py-1 rounded-xl text-sm bg-primary text-white hover:bg-hover"
                            onClick={() => console.log("action", account.id)}
                        >
                            Actions
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

/* --------------------------- Skeleton --------------------------- */
const SkeletonGrid: React.FC = () => {
    const items = new Array(6).fill(null);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((_, idx) => (
                <div
                    key={idx}
                    className="rounded-2xl p-4 bg-white shadow-sm border border-gray-100 animate-pulse"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100" />
                        <div className="flex-1 space-y-3 py-1">
                            <div className="w-3/4 h-4 bg-gray-100 rounded" />
                            <div className="w-1/2 h-3 bg-gray-100 rounded" />
                            <div className="flex justify-between items-center mt-2">
                                <div className="w-1/3 h-8 bg-gray-100 rounded" />
                                <div className="w-1/4 h-8 bg-gray-100 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
