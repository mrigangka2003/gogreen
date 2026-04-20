import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Settings,
    Layers,
    Leaf,
    Zap,
    Wind
} from "lucide-react";

const ServiceDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const service = location.state?.service;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!service) {
        return <Navigate to="/product-and-services" replace />;
    }

    // ✅ Proper separation of images
    const mainImage = service.image;

    const normalImages = Array.from(new Set([
        ...(service.gallery || [])
    ])).filter(Boolean);

    const extraImages = Array.from(new Set([
        ...(service.extraImages || [])
    ])).filter(Boolean);

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-neutral-600 hover:text-emerald-600 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest uppercase text-sm">
                        <Leaf className="w-4 h-4 fill-emerald-600" />
                        Go Green Plus
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="max-w-4xl mx-auto px-4 py-10 space-y-16">

                {/* TITLE */}
                <section className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3" />
                        Sustainable Solution
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-neutral-900">
                        {service.title}
                    </h1>

                    <p className="text-neutral-600 text-base md:text-lg max-w-2xl mx-auto">
                        {service.description}
                    </p>
                </section>

                {/* IMAGES */}
                <section className="space-y-10">

                    {/* Main Image */}
                    {mainImage && (
                        <div className="flex justify-center">
                            <img
                                src={mainImage}
                                alt="Main"
                                className="w-full max-w-2xl mx-auto rounded-2xl shadow-md"
                            />
                        </div>
                    )}

                    {/* Normal Images */}
                    {normalImages.map((img: string, idx: number) => (
                        <div key={idx} className="flex justify-center">
                            <img
                                src={img}
                                alt={`Gallery ${idx}`}
                                loading="lazy"
                                className="w-full max-w-2xl mx-auto rounded-xl shadow-sm"
                            />
                        </div>
                    ))}

                    {/* Extra Images (END) */}
                    {extraImages.length > 0 && (
                        <div className="pt-10 space-y-6">
                            <h3 className="text-center text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                Additional Views
                            </h3>

                            {extraImages.map((img: string, idx: number) => (
                                <div key={idx} className="flex justify-center">
                                    <img
                                        src={img}
                                        alt={`Extra ${idx}`}
                                        loading="lazy"
                                        className="w-full max-w-2xl mx-auto rounded-xl opacity-90"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* FEATURES */}
                {service.features?.length > 0 && (
                    <section className="space-y-6 text-center">
                        <h2 className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                            <Settings className="w-4 h-4" />
                            Core Features
                        </h2>

                        <ul className="grid sm:grid-cols-2 gap-4 text-left">
                            {service.features.map((f: string, i: number) => (
                                <li key={i} className="flex gap-3">
                                    <span className="w-2 h-2 mt-2 bg-emerald-500 rounded-full" />
                                    <span className="text-neutral-700 font-medium">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* BENEFITS */}
                {service.benefits?.length > 0 && (
                    <section className="space-y-6">
                        <h2 className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                            <ShieldCheck className="w-4 h-4" />
                            Key Advantages
                        </h2>

                        <div className="space-y-4">
                            {service.benefits.map((b: string, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border shadow-sm">
                                    <CheckCircle2 className="text-emerald-600 w-5 h-5" />
                                    <span className="font-semibold text-neutral-800">{b}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SPECIFICATIONS */}
                {service.specifications && Object.keys(service.specifications).length > 0 && (
                    <section className="space-y-8">
                        <h2 className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                            <Layers className="w-4 h-4" />
                            Technical Specifications
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {Object.entries(service.specifications).map(([key, value], i) => (
                                <div key={i} className="p-5 bg-white rounded-xl border shadow-sm text-center">
                                    <div className="text-xs font-bold uppercase text-emerald-600">{key}</div>
                                    <div className="text-lg font-semibold text-neutral-900">{value as string}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="text-center bg-neutral-900 rounded-2xl p-8 text-white space-y-5">
                <h3 className="text-xl font-bold">Ready to implement?</h3>
                <p className="text-neutral-400">
                    Get a consultation for <span className="text-emerald-400 font-semibold">{service.title}</span>
                </p>

                {/* Direct Email CTA */}
                <a
                    href={`mailto:gogreenplus@gmail.com?subject=Inquiry for ${encodeURIComponent(service.title)}&body=Hello,%0D%0A%0D%0AI am interested in the ${encodeURIComponent(service.title)}. Please share more details.%0D%0A%0D%0AThanks`}
                    className="inline-block px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition"
                >
                    Contact Specialist
                </a>

                {/* Visible email fallback */}
                <p className="text-sm text-neutral-400">
                    Or email directly: <span className="text-emerald-400">gogreenplus@gmail.com</span>
                </p>
                </section>

            </main>

            {/* FOOTER */}
            <footer className="bg-neutral-950 text-center py-10 mt-16 space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold uppercase tracking-widest">
                    <Wind className="w-5 h-5" />
                    Go Green Plus
                </div>

                <p className="text-neutral-500 text-sm max-w-md mx-auto">
                    Leading sustainable industrial solutions and clean energy innovation.
                </p>

                <p className="text-neutral-400 text-sm">
                    Contact: gogreenplus@gmail.com
                </p>
            </footer>
        </div>
    );
};

export default ServiceDetails;