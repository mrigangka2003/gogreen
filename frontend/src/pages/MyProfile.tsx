import { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/index";
import { useAuthStore, type User } from "../stores/auth";

const ENDPOINTS: Record<User["role"], string> = {
    user: "user/profile",
    emp: "/emp/profile",
    org: "/org/profile",
    admin: "/admin/profile",
    "super-admin": "/super/profile",
};

type Dto = { name: string; email: string; phone?: string; avatar?: string };

export default function Profile() {
    const user = useAuthStore((s) => s.user)!;
    const setUser = useAuthStore((s) => s.setUser);
    const [data, setData] = useState<Dto>({ name: "", email: "", phone: "" });
    const [preview, setPreview] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [delOpen, setDelOpen] = useState(0);

    const fileUrlRef = useRef<string | null>(null);

    /* fetch ------------------------------------------------ */
    useEffect(() => {
        (async () => {
            try {
                const { data: res } = await axiosInstance.get<{ data: Dto }>(
                    ENDPOINTS[user.role]
                );
                setData(res.data);
                setPreview(res.data.avatar || "");
                setUser({
                    ...user,
                    name: res.data.name,
                    email: res.data.email,
                });
            } catch (e: any) {
                setError(
                    e.response?.data?.message || e.message || "Load failed"
                );
            } finally {
                setLoading(false);
            }
        })();

        // cleanup preview URL on unmount
        return () => {
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = null;
            }
        };
    }, []);

    /* save ------------------------------------------------- */
    const save = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("name", data.name);
            fd.append("email", data.email);
            fd.append("phone", data.phone || "");
            if (file) fd.append("avatar", file);
            const { data: res } = await axiosInstance.patch<{ data: Dto }>(
                ENDPOINTS[user.role],
                fd,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            setData(res.data);
            setPreview(res.data.avatar || "");
            setUser({ ...user, name: res.data.name, email: res.data.email });
            setFile(null);
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = null;
            }
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    /* delete ----------------------------------------------- */
    const deleteProfile = async () => {
        if (delOpen !== 2) return;
        try {
            await axiosInstance.delete(ENDPOINTS[user.role]);
            window.location.href = "/"; // or logout flow
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || "Delete failed");
        }
    };

    /* ui --------------------------------------------------- */
    if (loading) return <Skeleton />;
    if (error) return <ErrorCard msg={error} />;

    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-5 sm:p-6 space-y-5 overflow-hidden">
                {/* avatar + name */}
                <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer flex-shrink-0">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    // revoke previous
                                    if (fileUrlRef.current)
                                        URL.revokeObjectURL(fileUrlRef.current);
                                    const url = URL.createObjectURL(f);
                                    fileUrlRef.current = url;
                                    setFile(f);
                                    setPreview(url);
                                }
                            }}
                        />
                        <img
                            src={
                                preview ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    data.name
                                )}&size=160&background=0D8ABC&color=fff`
                            }
                            alt="avatar"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 bg-sky-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                            Edit
                        </span>
                    </label>

                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {data.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 capitalize">
                            {user.role}
                        </p>
                    </div>
                </div>

                {/* fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        label="Name"
                        value={data.name}
                        onChange={(v) => setData({ ...data, name: v })}
                    />
                    <Input
                        label="Email"
                        value={data.email}
                        onChange={(v) => setData({ ...data, email: v })}
                    />
                    <Input
                        label="Phone"
                        value={data.phone ?? ""}
                        onChange={(v) => setData({ ...data, phone: v })}
                        className="sm:col-span-2"
                    />
                </div>

                {/* actions */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={save}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium shadow-sm hover:opacity-95 disabled:opacity-60 transition"
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>

                        <button
                            onClick={() => {
                                setFile(null);
                                if (fileUrlRef.current) {
                                    URL.revokeObjectURL(fileUrlRef.current);
                                    fileUrlRef.current = null;
                                }
                                setPreview(data.avatar || "");
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setDelOpen((s) =>
                                    s === 0 ? 1 : s === 1 ? 2 : 0
                                )
                            }
                            onMouseLeave={() => setDelOpen(0)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium focus:outline-none transition-all whitespace-nowrap ${
                                delOpen === 0
                                    ? "bg-white text-red-600 border border-red-200"
                                    : delOpen === 1
                                    ? "bg-red-600 text-white"
                                    : "bg-red-700 text-white"
                            }`}
                        >
                            {delOpen === 0
                                ? "Delete"
                                : delOpen === 1
                                ? "Confirm"
                                : "Click again"}
                        </button>

                        {delOpen === 2 && (
                            <button
                                onClick={deleteProfile}
                                className="px-3 py-2 rounded-lg bg-red-700 text-white text-sm shadow"
                            >
                                Delete Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ------------------ components ------------------ */
const Input = ({
    label,
    value,
    onChange,
    className = "",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    className?: string;
}) => (
    <div className={className}>
        <label className="text-xs text-gray-600">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 truncate"
        />
    </div>
);

const Skeleton = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-40" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded col-span-2" />
            </div>
            <div className="h-10 bg-gray-200 rounded w-20 ml-auto" />
        </div>
    </div>
);

const ErrorCard = ({ msg }: { msg: string }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-6 text-red-600 flex items-center gap-3 max-w-xl">
            <span>⚠️</span>
            <span>{msg}</span>
        </div>
    </div>
);
