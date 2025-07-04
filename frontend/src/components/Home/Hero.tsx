

const Hero = () => {
    return (
        <div>
            <div
                className="hero h-screen bg-gradient-to-br from-green-500 to-green-600 bg-cover bg-center flex justify-center items-center p-4"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488330890490-c291ecf62571?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
            >
                <div className="glass bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-md shadow-lg">
                    <div className="holo-text text-5xl md:text-6xl lg:text-7xl font-bold text-transparent stroke-2 stroke-white bg-[url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=1950&q=80')] bg-clip-text bg-center bg-cover text-center leading-tight">
                        Reconnect with the Earth. <br />
                        Breathe in Peace. Live Green.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero; 