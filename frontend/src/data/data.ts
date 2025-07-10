import k_dev from "../assets/team/adv_k_dev.jpeg";
import mk_deb from "../assets/team/dr_mk_deb.jpeg";
import dr_s_das from "../assets/team/Dr_s_das.png";
import dr_s_dasgupta from "../assets/team/dr_s_dasgupta.jpg";
import snc from "../assets/team/dr_snc.png";
import er_s_majumder from "../assets/team/er_s_majumder.jpeg";
import a_saha from "../assets/team/Mr.A.Saha.jpg";
import a_ghosh from "../assets/team/ms_a_ghosh.jpg";

interface Advisors {
    id:string;
    name: string;
    profession: string;
    affiliation?: string;
    country: string;
    image?: string;
    about: string;
}


const advisors :Array<Advisors> = [
    {
        id:"s_dasgupta",
        name:"Prof. (Dr.) Sabyasachi Dasgupta",
        profession:"Proffessor",
        affiliation:"Tripura University",
        country:"India",
        image:dr_s_dasgupta,
        about:"Prof. Sabyasachi Dasgupta is a leading academic in the field of forestry and environmental science, currently serving as Professor and Head of the Department of Forestry and Biodiversity at Tripura University (Central). With nearly two decades of experience in teaching, research, and institutional leadership, he brings deep expertise in biodiversity conservation, ecosystem services, forest ecology, and environmental impact assessment. He holds a Ph.D. in Forestry (Ecology &amp; Environment) from the Wildlife Institute of India, FRI University, and has taught in premier institutions including HNB Garhwal Central University and Central Agricultural University. Prof. Dasgupta has published over 45 research papers and book chapters. His research spans a wide range of ecological themes from climate change impacts in the Himalayas to bamboo biodiversity and sacred groves in Northeast India. He is also actively involved in environmental policy as a member of the State Level Environment Impact Assessment Authority and serves as Vice President of the North East Chapter of the Indian Ecological Society. As an Advisor to Go Green Plus, Prof. Dasgupta brings scientific rigor and strategic guidance in shaping ecological sustainability, afforestation, and biodiversity initiatives making him an invaluable asset to the company’s mission for green development.",
    },
    {   
        id:"s_nath_choudhury",
        name:"Prof. (Dr.) Swarnali Nath Choudhury",
        profession:"proffessor",
        affiliation:"ICFAI University,Tripura",
        country:"India",
        image:snc,
        about:"Dr. Swarnali Nath Choudhury is an accomplished academician, researcher, and academic leader with over 20 years of experience in the field of Chemistry and higher education. She holds an M.Sc. in Organic Chemistry and a Ph.D. in Medicinal Chemistry from Assam University, along with an M.Tech. in Petroleum Technology from Dibrugarh University. Currently, she serves as Professor of Chemistry and Dean of Placement at ICFAI University Tripura, where she plays a pivotal role in academic excellence and industry engagement. Dr. Choudhury’s research interests lie in Natural Products, Medicinal Chemistry, and Phytopharmacology, with a strong focus on traditional medicinal plants and their applications in tribal healthcare systems. She has published extensively in peer-reviewed journals and contributed chapters to academic books, reflecting her commitment to research and innovation. Her work bridges modern science with indigenous knowledge, making it both impactful and socially relevant. As an Advisor to our company Go Green Plus, Dr. Choudhury supports us by offering scientific and strategic guidance, fostering academia-industry collaboration, and helping to design effective training programs to enhance the skills of our employees and align them with current industry needs."
    },
    {   
        id:"shyamal_majumder",
        name:"Er. Shyamal Majumder",
        profession:"Proffessor",
        affiliation:"",
        country:"India",
        image:er_s_majumder,
        about:"engineer"
    },
    {   
        id:"abhijit_saha",
        name:"Mr. Abhijit Saha",
        profession:"entrepreneur",
        affiliation:"",
        country:"India",
        image:a_saha,
        about:"Abhijit Saha is a dynamic entrepreneur and the Founder-Director of Narayandip, a leading retail partner for top garment brands in Agartala, Tripura. With nearly two decades of experience, he has been instrumental in shaping the branded fashion retail, telecom, and distribution sectors in the region. Starting his journey in 2006 as a channel partner with Airtel, Abhijit expanded into DTH distribution and logistics by 2010. In 2013, he ventured into premium retail with the launch of the U.S. Polo Assn. store and steadily grew his portfolio to include major brands like ARROW, Pepe Jeans, Killer Jeans, Being Human, and CRIMSOUNE Club. Briefly entering electronics distribution with Samsung Mobile in 2021, Mr. Abhijit Saha has consistently demonstrated a keen eye for growth and diversification. Today, he is focused on strengthening his retail presence while exploring new ventures, earning wide respect in Tripura’s business community for his strategic vision and dedication to regional development."
    },
    {   
        id:"anamika_ghosh",
        name:"Ms. Anamika Ghosh",
        profession:"Researcher",
        affiliation:"University of Science and Technology, Meghalaya",
        country:"India",
        image:a_ghosh,
        about:"Ms. Anamika Ghosh is a committed environmental professional with a strong academic and industry background in Environmental Science, ESG (Environmental, Social, and Governance), and EHSS (Environment, Health, Safety, and Sustainability). She holds an M.Sc. in Environmental Sciences from the University of Science and Technology, Meghalaya (USTM), where she built a solid foundation in environmental systems and sustainable development practices. She began her professional journey with GICIA India Pvt. Ltd., where she served as a Senior Program Officer and contributed to sustainability focused programs, certification systems, and field-based environmental compliance activities. Currently, Mrs. Ghosh is working as a Senior Executive - ESG &amp; EHSS at INDUS Enviro, where she plays a vital role in designing and executing ESG strategies, environmental risk assessments, sustainability reporting, and regulatory compliance initiatives for corporate clients. Her work integrates policy, environmental due diligence, and stakeholder engagement to align business practices with global sustainability goals. As an Advisor to Go Green Plus, Ms. Anamika Ghosh brings in depth knowledge of environmental governance, risk management, and sustainable development frameworks. Her expertise supports the company’s mission to lead environmentally responsible projects while promoting long-term ecological and social impact."
    },
    {   
        id:"mrinal_kanti_deb",
        name:"Dr. Mrinal Kanti Deb",
        profession:"Proffesor",
        affiliation:"Downtown University,Assam",
        country:"India",
        image:mk_deb,
        about:" Dr. M.K. Deb is an esteemed academic and researcher in the field of rural development and migration studies. He currently serves as an Assistant Professor in the Faculty of Humanities and Social Sciences at Assam down town University, where he also coordinates the Institution’s Innovation Council (IIC). He holds both Master’s and Ph.D. degrees in Rural Management and Development. Dr. Deb has an extensive research portfolio, having published 7 journal articles and 9 book chapters in areas such as labor migration, tribal livelihoods, rural transformation, and social policy. His work includes empirical studies on Bangladesh-Tripura migration, livelihood shifts among the Kuki tribe, and the impact of welfare programs like MGNREGA on rural communities. He also developed innovative approaches for measuring tribal living standards using tools like Principal Component Analysis  As an Advisor to Go Green Plus, Dr. Deb contributes deep academic insight and grassroots experience to support the company’s vision for inclusive, sustainable development. His expertise enhances Go Green Plus focus on empowering rural communities through data-driven, environmentally conscious strategies."
    },
    {   
        id:"swapan_das",
        name:"Dr. Swapan Das",
        profession:"Engineer",
        affiliation:"",
        country:"India",
        image:dr_s_das,
        about:"  Dr. Swapan Das is a highly accomplished engineering professional with over 15 years of experience in Indian Railways and specialized academic expertise in Municipal Solid Waste Management. He holds an M.Tech. in Mechanical Engineering and a Ph.D. in Municipal Solid Waste Management from one of India’s premier technical institution-Indian Institute of Engineering Science and Technology, Shibpur, West Bengal. With a deep commitment to sustainable development and environmental engineering, Dr. Das has published 6 research papers in international journals, presented 5 papers at international conferences, and contributed 1 book chapter and 3 national conference papers focusing primarily on solid waste treatment, sustainable urban systems, and waste to energy technologies. Alongside his technical career in public infrastructure, Dr. Das also serves as the Chief Advisor of Ultimate Car Care, a car manufacturing cum modern service company, where he plays a pivotal role in process optimization  sustainable design, and operational efficiency. His contributions support innovation in eco-friendly automotive solutions and advanced servicing infrastructure. As an Advisor to Go Green Plus, Dr. Das will play a key role in guiding the development of the company’s two upcoming electric vehicles (EVs). His expertise in mechanical systems, process design, and sustainable technology integration makes him an invaluable asset in driving forward Go Green Plus’s mission of clean mobility and eco-conscious engineering."
    },
    {   
        id:"kushal_deb",
        name:"Advocate Kushal Deb",
        profession:"Advocate",
        affiliation:"",
        country:"India",
        image:k_dev,
        about:"Advocate Kushal Deb is a highly respected legal practitioner with a distinguished track record in civil, criminal, family, environmental and consumer law. With a large number of successfully handled cases and a renowned presence at the Tripura High Court, he is recognized for his sharp legal acumen, courtroom command, and commitment to justice. Over the years, Advocate Deb has built a reputation for delivering strategic legal solutions across a wide spectrum of matters, earning the trust of clients and peers alike. His ability to interpret and apply the law with precision makes him a sought- after counsel in both complex litigation and everyday legal affairs. As a Legal Advisor to Go Green Plus, Advocate Deb brings unmatched legal insight and experience to guide the organization in regulatory compliance, risk mitigation, and contractual governance. His involvement strengthens the company&#39;s foundation with lawful integrity and ensures that all initiatives align with current legal standards and ethical practices."
    }
]

export {
    advisors
}