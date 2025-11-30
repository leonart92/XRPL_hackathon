import React from 'react';
import { ArrowRight, Zap, TrendingUp, Shield, Globe, Users, Heart, Sparkles, Coins, Trash2, Gift, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {

    const features = [
        {
            icon: Users,
            title: 'Inclusive Finance',
            description: 'Mobile-accessible blockchain tools for everyone, even without a bank account. Micro-transactions and micro-credits.',
            color: 'blue',
            bgColor: 'bg-blue-500'
        },
        {
            icon: Heart,
            title: 'Transparent Aid',
            description: 'Traceable humanitarian aid systems. Tokenize donations with full transparency and verifiability.',
            color: 'pink',
            bgColor: 'bg-pink-500'
        },
        {
            icon: Shield,
            title: 'Verified Supply Chains',
            description: 'Transparent supply chains for humanitarian goods. Track medicines, food, and services with blockchain verification.',
            color: 'green',
            bgColor: 'bg-green-500'
        },
        {
            icon: Globe,
            title: 'Decentralized Impact',
            description: 'Empower communities through decentralized financial tools. Build sustainable solutions for vulnerable populations.',
            color: 'purple',
            bgColor: 'bg-purple-500'
        }
    ];

    const solutions = [
        {
            icon: TrendingUp,
            title: 'YIELD',
            description: 'Invest your XRP in environmental associations. Earn returns while supporting causes that matter.',
            features: ['Multiple vaults per association', 'Transparent APY', 'Real-time tracking', 'Easy withdrawals'],
            link: '/earn',
            color: 'blue',
            bgColor: 'bg-blue-600'
        },
        {
            icon: Trash2,
            title: 'DRAIN',
            description: 'Clean up dormant wallets in seconds. Donate leftover funds to humanitarian causes automatically.',
            features: ['One-click wallet scanning', 'Batch processing', 'Secure seed handling', 'Instant donations'],
            link: '/drainer',
            color: 'orange',
            bgColor: 'bg-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-slate-50" />

                <div className="relative z-10 container mx-auto px-4 py-20 text-center">
                    <div className="inline-block p-6">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-blue-600">
                            Yaid
                        </h1>
                    </div>

                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Building inclusive financial tools and transparent humanitarian systems
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/earn"
                            className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Start Yielding
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/drainer"
                            className="group px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 font-semibold rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Clean Wallets
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            Four Pillars of Impact
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Building the future of inclusive finance and transparent humanitarian aid
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                                    <div
                                        className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            Our Solutions
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Two powerful tools to maximize your impact
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {solutions.map((solution) => {
                            const Icon = solution.icon;
                            return (
                                <div
                                    key={solution.title}
                                    className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                                >

                                    <div className={`w-20 h-20 rounded-2xl ${solution.bgColor} flex items-center justify-center mb-6`}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-900 mb-3">{solution.title}</h3>
                                    <p className="text-slate-600 mb-6 text-lg leading-relaxed">{solution.description}</p>

                                    <ul className="space-y-3 mb-8">
                                        {solution.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-3 text-slate-700"
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={solution.link}
                                        className={`group inline-flex items-center gap-2 px-6 py-3 ${solution.bgColor} text-white font-semibold rounded-xl hover:shadow-lg hover:opacity-90 transition-all`}
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div>
                        <Sparkles className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Ready to Make an Impact?
                        </h2>
                        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
                            Join us in building a more inclusive and transparent financial future
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                to="/earn"
                                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Coins className="w-5 h-5" />
                                Start Investing
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/drainer"
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <Gift className="w-5 h-5" />
                                Donate Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

