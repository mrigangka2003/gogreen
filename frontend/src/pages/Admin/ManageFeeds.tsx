import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Loader2, Trash2, Edit2, Eye, Heart, Share2,
  MapPin, Calendar, Image, Video, Tag, X,
  FileText, Save,
  ImagePlus,
} from "lucide-react";
import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";

type FeedItem = {
  _id: string;
  heading: string;
  description: string;
  photos: string[];
  videos: string[];
  location?: { address: string };
  serviceType?: string;
  status: "draft" | "published" | "archived";
  createdBy?: { name?: string; email?: string };
  bookingId?: { serviceType?: string; date?: string };
  likeCount: number;
  shareCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
};

const statusColors: Record<string, string> = {
  published: "bg-green-50 text-green-700 border-green-100",
  draft: "bg-amber-50 text-amber-700 border-amber-100",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ManageFeeds() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super-admin";
  const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "archived">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit modal state
  const [editFeed, setEditFeed] = useState<FeedItem | null>(null);
  const [editHeading, setEditHeading] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editServiceType, setEditServiceType] = useState("");
  const [editStatus, setEditStatus] = useState<"published" | "draft" | "archived">("published");
  const [editTags, setEditTags] = useState("");
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [editVideos, setEditVideos] = useState<string[]>([]);
  const [editLocationAddress, setEditLocationAddress] = useState("");
  const [editLocationLat, setEditLocationLat] = useState("");
  const [editLocationLng, setEditLocationLng] = useState("");
  const [saving, setSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<{ success: boolean; data: FeedItem[] }>("/feeds/all");
      if (res.data?.success) {
        setFeeds(res.data.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch feeds:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFeeds(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feed post?")) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/feeds/${id}`);
      setFeeds((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Failed to delete feed:", err);
    }
    setDeletingId(null);
  };

  const openEdit = (feed: FeedItem) => {
    setEditFeed(feed);
    setEditHeading(feed.heading);
    setEditDescription(feed.description);
    setEditServiceType(feed.serviceType || "");
    setEditStatus(feed.status);
    setEditTags(feed.tags.join(", "));
    setEditPhotos([...feed.photos]);
    setEditVideos([...feed.videos]);
    setEditLocationAddress(feed.location?.address || "");
    setEditLocationLat("");
    setEditLocationLng("");
  };

  const handleEditSave = async () => {
    if (!editFeed) return;
    setSaving(true);
    try {
      const payload: any = {
        heading: editHeading.trim(),
        description: editDescription.trim(),
        serviceType: editServiceType.trim(),
        status: editStatus,
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
        photos: editPhotos,
        videos: editVideos,
      };
      if (editLocationAddress) {
        payload.location = {
          address: editLocationAddress,
          lat: editLocationLat ? parseFloat(editLocationLat) : undefined,
          lng: editLocationLng ? parseFloat(editLocationLng) : undefined,
        };
      }
      await axiosInstance.patch(`/feeds/${editFeed._id}`, payload);
      setEditFeed(null);
      fetchFeeds();
    } catch (err) {
      console.error("Failed to update feed:", err);
    }
    setSaving(false);
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setEditPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const filteredFeeds = feeds.filter((f) => {
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.heading.toLowerCase().includes(q) ||
        (f.serviceType || "").toLowerCase().includes(q) ||
        (f.createdBy?.name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Feeds</h1>
          <p className="text-sm text-gray-500 mt-1">{feeds.length} total posts</p>
        </div>
        <button
          onClick={() => navigate(`${basePath}/create-feed`)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors shadow-lg shadow-[#38B000]/20"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feeds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#38B000]/30"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "published", "draft", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterStatus === s ? "bg-[#38B000] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#38B000]" />
        </div>
      ) : filteredFeeds.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-lg font-medium">No feeds found</p>
          <p className="text-gray-300 text-sm mt-1">Create your first post to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeeds.map((feed) => (
            <div key={feed._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                {/* Thumbnail */}
                {feed.photos.length > 0 && (
                  <div className="w-32 sm:w-44 flex-shrink-0 bg-gray-100">
                    <img src={feed.photos[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[feed.status]}`}>
                          {feed.status}
                        </span>
                        {feed.bookingId && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                            From Booking
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{feed.heading}</h3>
                      {feed.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{feed.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(feed)}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#38B000]/10 flex items-center justify-center text-gray-500 hover:text-[#38B000] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(feed._id)}
                        disabled={deletingId === feed._id}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === feed._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] sm:text-xs text-gray-400">
                    {feed.serviceType && (
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{feed.serviceType}</span>
                    )}
                    {feed.location?.address && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{feed.location.address}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(feed.createdAt)}</span>
                    {feed.photos.length > 0 && (
                      <span className="flex items-center gap-1"><Image className="w-3 h-3" />{feed.photos.length}</span>
                    )}
                    {feed.videos.length > 0 && (
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" />{feed.videos.length}</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-medium">{feed.viewCount}</span> views
                    </span>
                    <span className="flex items-center gap-1 text-red-400">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="font-medium">{feed.likeCount}</span> likes
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="font-medium">{feed.shareCount}</span> shares
                    </span>
                    {feed.createdBy?.name && (
                      <span className="text-gray-400 ml-auto hidden sm:block">
                        by {feed.createdBy.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editFeed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Feed Post</h2>
              <button onClick={() => setEditFeed(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Heading */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Heading</label>
                <input
                  value={editHeading}
                  onChange={(e) => setEditHeading(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm resize-none"
                />
              </div>

              {/* Service Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Service Type</label>
                  <input
                    value={editServiceType}
                    onChange={(e) => setEditServiceType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tags</label>
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  placeholder="comma separated"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input
                  value={editLocationAddress}
                  onChange={(e) => setEditLocationAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  placeholder="Address"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Photos</label>
                <div className="flex flex-wrap gap-2">
                  {editPhotos.map((photo, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setEditPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => editFileRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#38B000] hover:text-[#38B000]"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>
                </div>
                <input ref={editFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditPhotoUpload} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditFeed(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors text-sm disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
