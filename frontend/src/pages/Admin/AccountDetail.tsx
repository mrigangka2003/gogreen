import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, User, Mail, Phone, MapPin, Calendar, Clock,
  ClipboardList, Star, Edit2, CheckCircle2, AlertCircle, Play, XCircle,
  Building2, Shield,
} from "lucide-react";
import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";

type AccountInfo = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  role?: { name: string };
  createdAt?: string;
};

type BookingItem = {
  _id: string;
  serviceType: string;
  address: string;
  date: string;
  timeSlot?: string;
  status: string;
  amount?: number;
  paymentStatus?: string;
  createdAt?: string;
};

type ReviewItem = {
  _id: string;
  rating: number;
  feedback?: string;
  bookingId?: { serviceType?: string; date?: string } | string;
  createdAt?: string;
};

function fmtDate(d?: string | Date | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function statusStyle(s: string) {
  const m: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    assigned: "bg-blue-50 text-blue-700",
    started: "bg-purple-50 text-purple-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return m[s?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
}

function statusIcon(s: string) {
  const map: Record<string, React.ElementType> = {
    pending: AlertCircle,
    assigned: AlertCircle,
    started: Play,
    completed: CheckCircle2,
    cancelled: XCircle,
  };
  return map[s?.toLowerCase()] ?? AlertCircle;
}

function roleDisplayName(role?: string) {
  const map: Record<string, string> = { user: "User", org: "Organization", emp: "Employee", admin: "Admin", "super-admin": "Super Admin" };
  return map[role || ""] || role || "User";
}

function roleIcon(role?: string) {
  if (role === "org") return <Building2 className="w-4 h-4" />;
  if (role === "admin" || role === "super-admin") return <Shield className="w-4 h-4" />;
  return <User className="w-4 h-4" />;
}

const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super-admin";
  const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const prefix = isSuperAdmin ? "/super" : "/admin";

        // Fetch account info
        const accRes = await axiosInstance.get(`${prefix}/accounts`);
        if ((accRes.data as any)?.success) {
          const accounts = (accRes.data as any).data ?? [];
          const acc = accounts.find((a: any) => a._id === id);
          if (!acc) { setError("Account not found"); return; }
          setAccount(acc);
        }

        // Fetch booking history
        const bookRes = await axiosInstance.get(`${prefix}/accounts/${id}/bookings`);
        if ((bookRes.data as any)?.success) {
          setBookings((bookRes.data as any).data ?? []);
        }

        // Fetch reviews (filter by userId on client since API returns all)
        const revRes = await axiosInstance.get(`${prefix}/reviews`);
        if ((revRes.data as any)?.success) {
          const allReviews = (revRes.data as any).data ?? [];
          const userReviews = allReviews.filter((r: any) =>
            (r.userId?._id || r.userId) === id
          );
          setReviews(userReviews);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#38B000]" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100">{error || "Account not found"}</div>
      </div>
    );
  }

  const roleName = account.role?.name || "user";
  const activeBookings = bookings.filter((b) => ["pending", "assigned", "started"].includes(b.status));
  const pastBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-[#38B000] to-[#2d8c00]" />
            <div className="px-6 pb-6 -mt-10">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-[#38B000] font-bold text-2xl uppercase">
                {account.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-3">{account.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${account.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {account.isActive ? "Active" : "Inactive"}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
                  {roleIcon(roleName)}
                  {roleDisplayName(roleName)}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{account.email}</span>
                </div>
                {account.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{account.phone}</span>
                  </div>
                )}
                {account.address && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{account.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Joined {fmtDate(account.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`${basePath}/account/${id}`)}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-[#38B000] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Account
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Overview</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{bookings.length}</p>
                <p className="text-[10px] text-blue-600 mt-0.5">Total Orders</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-700">{pastBookings.filter(b => b.status === "completed").length}</p>
                <p className="text-[10px] text-green-600 mt-0.5">Completed</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-700">{reviews.length}</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Reviews</p>
              </div>
            </div>
            {avgRating && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-xl">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-yellow-700">{avgRating}</span>
                <span className="text-xs text-yellow-600">avg rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bookings & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Active Bookings
              {activeBookings.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                  {activeBookings.length}
                </span>
              )}
            </h3>
            {activeBookings.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No active bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => {
                  const Icon = statusIcon(b.status);
                  return (
                    <div
                      key={b._id}
                      onClick={() => navigate(`${basePath}/booking/${b._id}`)}
                      className="p-4 rounded-xl border border-gray-100 hover:border-[#38B000]/30 hover:shadow-md cursor-pointer transition-all bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{b.serviceType}</h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{b.address}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusStyle(b.status)}`}>
                          <Icon className="w-3 h-3" />
                          {b.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(b.date)}</span>
                        {b.timeSlot && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.timeSlot}</span>}
                        {b.amount != null && b.amount > 0 && <span className="font-medium text-gray-600">₹{b.amount}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              Past Bookings
              {pastBookings.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
                  {pastBookings.length}
                </span>
              )}
            </h3>
            {pastBookings.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No past bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastBookings.map((b) => {
                  const Icon = statusIcon(b.status);
                  return (
                    <div
                      key={b._id}
                      onClick={() => navigate(`${basePath}/booking/${b._id}`)}
                      className="p-4 rounded-xl border border-gray-100 hover:border-[#38B000]/30 hover:shadow-md cursor-pointer transition-all bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{b.serviceType}</h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{b.address}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusStyle(b.status)}`}>
                          <Icon className="w-3 h-3" />
                          {b.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(b.date)}</span>
                        {b.timeSlot && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.timeSlot}</span>}
                        {b.amount != null && b.amount > 0 && <span className="font-medium text-gray-600">₹{b.amount}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Reviews
              {reviews.length > 0 && (
                <span className="ml-auto px-2.5 py-0.5 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700">
                  {reviews.length}
                </span>
              )}
            </h3>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                        <span className="text-xs font-bold text-gray-700 ml-1">{r.rating}/5</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    {r.feedback && <p className="text-sm text-gray-600 leading-relaxed">{r.feedback}</p>}
                    {typeof r.bookingId === "object" && r.bookingId?.serviceType && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        {r.bookingId.serviceType}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
