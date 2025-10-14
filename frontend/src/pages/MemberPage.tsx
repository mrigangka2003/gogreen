import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Linkedin, Mail, BadgeInfo } from "lucide-react";

import { advisors, executives, itTeam } from "../data/data";

// =====================
// Types
// =====================

type BaseMember = {
    id: string;
    name: string;
    country?: string;
    image?: string;
    about?: string;
};

type Advisor = BaseMember & {};

type Executive = BaseMember & {
    email?: string;
    linkedIn?: string;
};

type ITMember = BaseMember & {
    role?: string; // e.g., "Developer"
    linkedIn?: string;
    email?: string;
};

type MemberKind = "advisor" | "executive" | "it";

type AnyMember = (Advisor | Executive | ITMember) & { __kind: MemberKind };

// =====================
// Component
// =====================
const MemberPage = () => {
    const navigate = useNavigate();
    const { memberId } = useParams<{ memberId: string }>();

    const member: AnyMember | null = useMemo(() => {
        if (!memberId) return null;

        const a = advisors.find((m: Advisor) => m.id === memberId);
        if (a) return { ...a, __kind: "advisor" as const };

        const e = executives.find((m: Executive) => m.id === memberId);
        if (e) return { ...e, __kind: "executive" as const };

        const i = itTeam.find((m: ITMember) => m.id === memberId);
        if (i) return { ...i, __kind: "it" as const };

        return null;
    }, [memberId]);

    if (!member) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Profile Not Found
                    </h2>
                    <p className="text-gray-600">
                        The profile you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-400 shadow-sm"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header with back button */}
            <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to About</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <ProfileView member={member} />
        </div>
    );
};

// =====================
// Shared Profile View
// =====================
const ProfileView = ({ member }: { member: AnyMember }) => {
    const { name, country, image, about, __kind } = member;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white shadow-xl overflow-hidden rounded-2xl">
                {/* Hero */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 text-xs uppercase tracking-wide bg-white/10 text-white/90 rounded-full">
                                    {labelForKind(__kind)}
                                </span>
                                {"role" in member && member.role ? (
                                    <span className="px-3 py-1 text-xs bg-white text-primary-700 rounded-full">
                                        {member.role}
                                    </span>
                                ) : null}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight text-white">
                                {name}
                            </h1>
                            {country ? (
                                <p className="text-lg text-primary-100 font-light flex items-center gap-2">
                                    <MapPin size={18} /> {country}
                                </p>
                            ) : null}

                            <div className="mt-5 flex flex-wrap items-center gap-4">
                                {"email" in member && member.email ? (
                                    <a
                                        href={`mailto:${member.email}`}
                                        className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                                    >
                                        <Mail size={18} /> {member.email}
                                    </a>
                                ) : null}
                                {"linkedIn" in member && member.linkedIn ? (
                                    <a
                                        href={member.linkedIn}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                                        aria-label="LinkedIn profile"
                                    >
                                        <Linkedin size={18} /> LinkedIn
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        {/* Right - Photo */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={name}
                                        className="w-64 h-64 object-cover shadow-2xl border-4 border-white rounded-xl"
                                    />
                                ) : (
                                    <div className="w-64 h-64 bg-gray-200 flex items-center justify-center shadow-2xl border-4 border-white rounded-xl">
                                        <span className="text-gray-500 text-lg">
                                            No Image
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="px-8 py-12">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            About {name}
                        </h2>

                        {about ? (
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {about}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <BadgeInfo size={18} />
                                <span>Bio coming soon.</span>
                            </div>
                        )}

                        {/* Professional Information */}
                        <div className="mt-12 bg-gradient-to-r from-gray-50 to-white p-8 border-l-4 border-primary-500 rounded-r-lg">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                Professional Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {country ? (
                                    <InfoRow
                                        icon={
                                            <MapPin
                                                size={20}
                                                className="text-primary-600"
                                            />
                                        }
                                        label="Country"
                                        value={country}
                                    />
                                ) : null}

                                {"role" in member && member.role ? (
                                    <InfoRow label="Role" value={member.role} />
                                ) : null}

                                {"email" in member && member.email ? (
                                    <InfoRow
                                        label="Email"
                                        value={
                                            <a
                                                className="text-primary-600 hover:underline"
                                                href={`mailto:${member.email}`}
                                            >
                                                {member.email}
                                            </a>
                                        }
                                    />
                                ) : null}

                                {"linkedIn" in member && member.linkedIn ? (
                                    <InfoRow
                                        label="LinkedIn"
                                        value={
                                            <a
                                                className="inline-flex items-center gap-2 text-primary-600 hover:underline"
                                                href={member.linkedIn}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            >
                                                <Linkedin size={18} /> View
                                                profile
                                            </a>
                                        }
                                    />
                                ) : null}
                            </div>
                        </div>

                        {/* Advisor badge */}
                        {member.__kind === "advisor" ? (
                            <div className="mt-12 text-center">
                                <div className="inline-flex items-center space-x-2 bg-primary-50 px-6 py-3 border border-primary-200 rounded-full">
                                    <span className="text-primary-700 font-medium">
                                        Trusted Advisor & Industry Expert
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =====================
// Small components & utils
// =====================
const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode | string | undefined;
}) => (
    <div className="flex items-start gap-3">
        {icon ?? null}
        <div>
            <span className="text-gray-700 font-medium block">{label}</span>
            <span className="text-gray-600 break-words">{value}</span>
        </div>
    </div>
);

function labelForKind(kind: MemberKind) {
    if (kind === "advisor") return "Advisor";
    if (kind === "executive") return "Executive";
    return "IT Team";
}

export default MemberPage;
