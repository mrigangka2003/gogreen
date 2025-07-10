import { AboutBanner, OurMission, VisitCareer,Team } from "../components";

const About = () => {
    return (
        <div>
            <AboutBanner/>
            <OurMission/>
            <Testimonial />
            <VisitCareer/>
            <Team/>
        </div>
    );
};

export default About;

const Testimonial = () => (
    <section className="py-16 bg-primary text-white text-center px-4">
        <blockquote className="max-w-4xl mx-auto text-xl italic">
            “GoGreen+ isn’t just about cleaning — it’s about restoring dignity
            to public spaces and creating a better tomorrow for all.”
        </blockquote>
        <p className="mt-4 font-bold">— Community Partner, Tripura</p>
    </section>
);
