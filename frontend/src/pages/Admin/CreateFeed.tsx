import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, ImagePlus, X, MapPin, Tag, FileText,
  ClipboardList, Search, ChevronDown, Video,
  Save, Send as SendIcon,
} from "lucide-react";
import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";

type BookingOption = {
  _id: string;
  serviceType: string;
  address: string;
  date: string;
  status: string;
  userId?: { name?: string };
};

type BookingFeedData = {
  booking: { _id: string; serviceType: string; address: string; date: string; status: string; userName?: string };
  photos: string[];
  videos: string[];
  locations: { start: { lat?: number; lng?: number }[]; end: { lat?: number; lng?: number }[] };
};

export default function CreateFeed() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super-admin";
  const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [tags, setTags] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [startLocationAddress, setStartLocationAddress] = useState("");
  const [startLocationLat, setStartLocationLat] = useState("");
  const [startLocationLng, setStartLocationLng] = useState("");
  const [endLocationAddress, setEndLocationAddress] = useState("");
  const [endLocationLat, setEndLocationLat] = useState("");
  const [endLocationLng, setEndLocationLng] = useState("");
  const [feedStatus, setFeedStatus] = useState<"published" | "draft">("published");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Booking selector
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [bookingSearch, setBookingSearch] = useState("");
  const [showBookingPicker, setShowBookingPicker] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingBookingData, setLoadingBookingData] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Fetch completed bookings for the picker
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const prefix = isSuperAdmin ? "/super" : "/admin";
        const res = await axiosInstance.get<{ success: boolean; data: BookingOption[] }>(`${prefix}/bookings`);
        if (res.data?.success) {
          const all = res.data.data ?? [];
          // Show completed bookings first, then others
          const sorted = all.sort((a, b) => {
            if (a.status === "completed" && b.status !== "completed") return -1;
            if (a.status !== "completed" && b.status === "completed") return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setBookings(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
      setLoadingBookings(false);
    };
    fetchBookings();
  }, [isSuperAdmin]);

  const handleSelectBooking = async (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowBookingPicker(false);
    setLoadingBookingData(true);

    try {
      const res = await axiosInstance.get<{ success: boolean; data: BookingFeedData }>(`/feeds/booking/${bookingId}`);
      if (res.data?.success) {
        const data = res.data.data;

        // Populate form with booking data
        setServiceType(data.booking.serviceType || "");
        if (!heading) setHeading(`${data.booking.serviceType} - ${data.booking.userName || "Service"}`);
        setLocationAddress(data.booking.address || "");

        // Add photos and videos from booking
        if (data.photos.length > 0) setPhotos((prev) => [...prev, ...data.photos]);
        if (data.videos.length > 0) setVideos((prev) => [...prev, ...data.videos]);

        // Set locations
        if (data.locations.start.length > 0) {
          const sl = data.locations.start[0];
          setStartLocationAddress(data.booking.address || "");
          if (sl.lat) setStartLocationLat(String(sl.lat));
          if (sl.lng) setStartLocationLng(String(sl.lng));
        }
        if (data.locations.end.length > 0) {
          const el = data.locations.end[0];
          setEndLocationAddress(data.booking.address || "");
          if (el.lat) setEndLocationLat(String(el.lat));
          if (el.lng) setEndLocationLng(String(el.lng));
        }
      }
    } catch (err) {
      console.error("Failed to fetch booking feed data:", err);
    }
    setLoadingBookingData(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setVideos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));
  const removeVideo = (idx: number) => setVideos((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!heading.trim()) { setError("Heading is required"); return; }
    setSaving(true);
    setError(null);

    try {
      const payload: {
        heading: string;
        description: string;
        serviceType: string;
        status: string;
        photos: string[];
        videos: string[];
        tags: string[];
        source: string;
        bookingId?: string;
        location?: { address: string; lat?: number; lng?: number };
        startLocation?: { address: string; lat?: number; lng?: number };
        endLocation?: { address: string; lat?: number; lng?: number };
      } = {
        heading: heading.trim(),
        description: description.trim(),
        serviceType: serviceType.trim(),
        status: feedStatus,
        photos,
        videos,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        source: selectedBookingId ? "booking" : "manual",
      };

      if (selectedBookingId) payload.bookingId = selectedBookingId;

      // Location
      if (locationAddress) {
        payload.location = {
          address: locationAddress,
          lat: locationLat ? parseFloat(locationLat) : undefined,
          lng: locationLng ? parseFloat(locationLng) : undefined,
        };
      }
      if (startLocationAddress) {
        payload.startLocation = {
          address: startLocationAddress,
          lat: startLocationLat ? parseFloat(startLocationLat) : undefined,
          lng: startLocationLng ? parseFloat(startLocationLng) : undefined,
        };
      }
      if (endLocationAddress) {
        payload.endLocation = {
          address: endLocationAddress,
          lat: endLocationLat ? parseFloat(endLocationLat) : undefined,
          lng: endLocationLng ? parseFloat(endLocationLng) : undefined,
        };
      }

      await axiosInstance.post("/feeds", payload);
      navigate(`${basePath}/manage-feeds`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create feed");
    } finally {
      setSaving(false);
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.serviceType.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.address.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.userId?.name || "").toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const statusColors: Record<string, string> = {
    completed: "bg-green-50 text-green-700",
    started: "bg-purple-50 text-purple-700",
    assigned: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Feed Post</h1>
        <p className="text-gray-500 mt-1">Create a new post manually or from an existing booking.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">{error}</div>
      )}

      {/* Booking Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#38B000]" />
          Import from Booking
          <span className="text-xs text-gray-400 font-normal">(optional)</span>
        </h3>

        {selectedBookingId ? (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Booking selected — data loaded into form
              </span>
            </div>
            <button
              onClick={() => setSelectedBookingId(null)}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowBookingPicker(!showBookingPicker)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-600"
            >
              <span>Select a booking to import photos, videos & location...</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showBookingPicker ? "rotate-180" : ""}`} />
            </button>

            {showBookingPicker && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-[#38B000]/30"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-60">
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <p className="text-center py-6 text-sm text-gray-400">No bookings found</p>
                  ) : (
                    filteredBookings.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => handleSelectBooking(b._id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{b.serviceType}</p>
                          <p className="text-xs text-gray-400 truncate">{b.address}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-400">{fmtDate(b.date)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[b.status] || "bg-gray-100 text-gray-600"}`}>
                            {b.status}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {loadingBookingData && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading booking data...
          </div>
        )}
      </div>

      {/* Main Form */}
      <div className="space-y-6">
        {/* Heading & Description */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Heading *</span>
            </label>
            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] bg-gray-50 focus:bg-white"
              placeholder="e.g. Deep Cleaning at Green Valley Apartments"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] bg-gray-50 focus:bg-white resize-none"
              placeholder="Describe the work done, before/after results, customer feedback..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> Service Type</span>
              </label>
              <input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white"
                placeholder="e.g. Deep Cleaning"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> Tags</span>
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white"
                placeholder="cleaning, residential (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <span className="flex items-center gap-2"><ImagePlus className="w-4 h-4 text-gray-400" /> Photos</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#38B000] hover:text-[#38B000] transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px] mt-1">Add</span>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </div>

        {/* Videos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" /> Videos</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {videos.map((video, idx) => (
              <div key={idx} className="relative w-32 h-24 rounded-xl overflow-hidden border border-gray-200 group bg-black">
                {video.startsWith("data:video") ? (
                  <video src={video} className="w-full h-full object-cover" />
                ) : (
                  <video src={video} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Video className="w-6 h-6 text-white/80" />
                </div>
                <button
                  onClick={() => removeVideo(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-32 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#38B000] hover:text-[#38B000] transition-colors"
            >
              <Video className="w-5 h-5" />
              <span className="text-[10px] mt-1">Add Video</span>
            </button>
          </div>
          <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <label className="block text-sm font-bold text-gray-700">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Location</span>
          </label>

          {/* Single location */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Primary Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="sm:col-span-3 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm"
                placeholder="Address"
              />
              <input
                value={locationLat}
                onChange={(e) => setLocationLat(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm"
                placeholder="Latitude"
              />
              <input
                value={locationLng}
                onChange={(e) => setLocationLng(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm"
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* Start location */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Start Location <span className="text-gray-400">(optional)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={startLocationAddress}
                onChange={(e) => setStartLocationAddress(e.target.value)}
                className="sm:col-span-3 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm"
                placeholder="Start address"
              />
              <input value={startLocationLat} onChange={(e) => setStartLocationLat(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Lat" />
              <input value={startLocationLng} onChange={(e) => setStartLocationLng(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Lng" />
            </div>
          </div>

          {/* End location */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">End Location <span className="text-gray-400">(optional)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={endLocationAddress}
                onChange={(e) => setEndLocationAddress(e.target.value)}
                className="sm:col-span-3 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 bg-gray-50 focus:bg-white text-sm"
                placeholder="End address"
              />
              <input value={endLocationLat} onChange={(e) => setEndLocationLat(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Lat" />
              <input value={endLocationLng} onChange={(e) => setEndLocationLng(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Lng" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { setFeedStatus("draft"); handleSubmit(); }}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
          <button
            onClick={() => { setFeedStatus("published"); handleSubmit(); }}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors disabled:opacity-70 shadow-lg shadow-[#38B000]/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
